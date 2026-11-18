/**
 * ==============================================================================
 * GHOST-TRACK BANTEN - ENTERPRISE BACKEND REST API
 * Framework: Node.js & Express.js
 * Database: Supabase PostgreSQL Client (with Graceful In-Memory Fallback)
 * Security: JWT Authentication & bcryptjs Password Verification
 * ==============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ghosttrack_default_jwt_secret_2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ghosttrack2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static frontend assets from workspace root
app.use(express.static(path.join(__dirname)));

// Initialize Supabase Client
// Sanitize URL by removing trailing /rest/v1/ or /rest/v1 to prevent double path issues
const rawUrl = process.env.SUPABASE_URL || '';
const cleanSupabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

let supabase = null;
if (cleanSupabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(cleanSupabaseUrl, supabaseServiceKey);
    console.log(`[Supabase] Terhubung ke: ${cleanSupabaseUrl}`);
  } catch (err) {
    console.warn('[Supabase] Gagal menginisialisasi client:', err.message);
  }
} else {
  console.warn('[Supabase] Kredensial URL / Service Key belum lengkap di .env. Mengaktifkan in-memory fallback.');
}

// In-Memory Fallback Store (Ensures 100% server uptime even if Supabase table is not yet migrated)
let inMemoryReports = [
  {
    id: 'rep-btn-001',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    gear_type: 'Jaring Rajungan (Gillnet)',
    latitude: -5.9680,
    longitude: 106.1820,
    description: 'Jaring monofilamen tersangkut di koloni karang Acropora bercabang kedalaman 9 meter.',
    reporter_name: 'Pak Sulaeman (Kelompok Nelayan Karangantu)',
    contact_num: '081234567890',
    photo_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    status: 'verified',
    risk_level: 4,
    admin_notes: 'Telah diverifikasi tim patroli konservasi Teluk Banten. Siap dievakuasi untuk modul EcoReef.'
  },
  {
    id: 'rep-btn-002',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    gear_type: 'Bubu Lipat (Wire Trap)',
    latitude: -6.0025,
    longitude: 106.1650,
    description: 'Dua unit bubu kawat berkarat tertimbun sedimen lumpur di mulut alur kapal Karangantu.',
    reporter_name: 'H. Dahlan (Nahkoda KM Bahari)',
    contact_num: '081987654321',
    photo_url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80',
    status: 'pending',
    risk_level: 2,
    admin_notes: null
  }
];

// Helper: JWT Authentication Middleware for Admin Protection
function verifyAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token autentikasi tidak ditemukan.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid atau telah kedaluwarsa.' });
    }
    req.admin = decoded;
    next();
  });
}

/* ==============================================================================
   PUBLIC REST API ENDPOINTS
   ============================================================================== */

/**
 * GET /api/reports/public
 * Mengambil semua data laporan warga yang telah berstatus 'verified' untuk peta Leaflet
 */
app.get('/api/reports/public', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'verified')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return res.json({
          success: true,
          source: 'supabase',
          count: data.length,
          data
        });
      }
      console.warn('[Supabase Fallback] Query reports gagal atau tabel belum ada:', error?.message);
    }

    // Fallback to in-memory store
    const verified = inMemoryReports.filter(r => r.status === 'verified');
    return res.json({
      success: true,
      source: 'in-memory-fallback',
      count: verified.length,
      data: verified
    });
  } catch (err) {
    console.error('Error GET /api/reports/public:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
});

/**
 * POST /api/reports/submit
 * Form publik bagi warga / nelayan untuk mengajukan laporan temuan ALDFG
 */
app.post('/api/reports/submit', async (req, res) => {
  try {
    const {
      gear_type,
      latitude,
      longitude,
      description,
      reporter_name,
      contact_num,
      photo_url
    } = req.body;

    // Validasi field wajib
    if (!gear_type || latitude === undefined || longitude === undefined || !reporter_name) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi field wajib: jenis alat tangkap, koordinat (latitude & longitude), dan nama pelapor.'
      });
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({
        success: false,
        message: 'Format koordinat latitude dan longitude tidak valid.'
      });
    }

    const newReport = {
      gear_type: String(gear_type).trim(),
      latitude: latNum,
      longitude: lngNum,
      description: description ? String(description).trim() : '',
      reporter_name: String(reporter_name).trim(),
      contact_num: contact_num ? String(contact_num).trim() : '',
      photo_url: photo_url ? String(photo_url).trim() : '',
      status: 'pending',
      risk_level: 1,
      admin_notes: null,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('reports')
        .insert([newReport])
        .select();

      if (!error && data && data.length > 0) {
        return res.status(201).json({
          success: true,
          source: 'supabase',
          message: 'Laporan temuan berhasil dikirim dan menunggu verifikasi admin.',
          data: data[0]
        });
      }
      console.warn('[Supabase Fallback] Insert report gagal:', error?.message);
    }

    // Fallback store
    const localId = 'rep-local-' + Date.now().toString(36);
    const saved = { ...newReport, id: localId };
    inMemoryReports.unshift(saved);

    return res.status(201).json({
      success: true,
      source: 'in-memory-fallback',
      message: 'Laporan temuan berhasil dikirim dan sedang dalam antrean verifikasi admin.',
      data: saved
    });
  } catch (err) {
    console.error('Error POST /api/reports/submit:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan laporan.' });
  }
});

/* ==============================================================================
   ADMIN REST API ENDPOINTS (PROTECTED VIA JWT)
   ============================================================================== */

/**
 * POST /api/admin/login
 * Verifikasi kredensial admin dan menerbitkan token JWT
 */
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }

    const isUserMatch = username.trim() === ADMIN_USERNAME;
    let isPassMatch = false;

    // Support both plain password in .env and bcrypt hashed password
    if (ADMIN_PASSWORD.startsWith('$2a$') || ADMIN_PASSWORD.startsWith('$2b$')) {
      isPassMatch = await bcrypt.compare(password, ADMIN_PASSWORD);
    } else {
      isPassMatch = password === ADMIN_PASSWORD;
    }

    if (!isUserMatch || !isPassMatch) {
      return res.status(401).json({ success: false, message: 'Username atau password admin salah.' });
    }

    // Penerbitan JWT Token (24 jam)
    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login admin berhasil.',
      token,
      admin: { username: ADMIN_USERNAME }
    });
  } catch (err) {
    console.error('Error POST /api/admin/login:', err);
    res.status(500).json({ success: false, message: 'Gagal memproses login admin.' });
  }
});

/**
 * GET /api/admin/reports
 * Mengambil semua data laporan (pending, verified, rejected) untuk dashboard moderasi
 */
app.get('/api/admin/reports', verifyAdminToken, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return res.json({
          success: true,
          source: 'supabase',
          count: data.length,
          data
        });
      }
      console.warn('[Supabase Fallback] Query admin reports gagal:', error?.message);
    }

    res.json({
      success: true,
      source: 'in-memory-fallback',
      count: inMemoryReports.length,
      data: inMemoryReports
    });
  } catch (err) {
    console.error('Error GET /api/admin/reports:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data laporan.' });
  }
});

/**
 * PATCH /api/admin/reports/:id
 * Mengupdate status moderasi ('verified' / 'rejected'), level risiko (1-4), dan catatan admin
 */
app.patch('/api/admin/reports/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, risk_level, admin_notes } = req.body;

    const validStatuses = ['pending', 'verified', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilihan yang diizinkan: ${validStatuses.join(', ')}.`
      });
    }

    let parsedRisk = undefined;
    if (risk_level !== undefined && risk_level !== null) {
      parsedRisk = parseInt(risk_level, 10);
      if (isNaN(parsedRisk) || parsedRisk < 1 || parsedRisk > 4) {
        return res.status(400).json({
          success: false,
          message: 'Tingkat risiko harus bernilai integer antara 1 sampai 4.'
        });
      }
    }

    const updates = {};
    if (status) updates.status = status;
    if (parsedRisk !== undefined) updates.risk_level = parsedRisk;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    if (supabase) {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select();

      if (!error && data && data.length > 0) {
        return res.json({
          success: true,
          source: 'supabase',
          message: 'Status laporan berhasil diperbarui.',
          data: data[0]
        });
      }
      console.warn('[Supabase Fallback] Update report gagal:', error?.message);
    }

    // In-Memory Fallback update
    const targetIdx = inMemoryReports.findIndex(r => String(r.id) === String(id));
    if (targetIdx === -1) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan.' });
    }

    inMemoryReports[targetIdx] = {
      ...inMemoryReports[targetIdx],
      ...updates
    };

    return res.json({
      success: true,
      source: 'in-memory-fallback',
      message: 'Status laporan berhasil diperbarui.',
      data: inMemoryReports[targetIdx]
    });
  } catch (err) {
    console.error('Error PATCH /api/admin/reports/:id:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status laporan.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`
==============================================================================
 GHOST-TRACK BANTEN - ENTERPRISE REST API SERVER
 Server aktif di: http://localhost:${PORT}
 -----------------------------------------------------------------------------
 Endpoint Publik:
  - GET  /api/reports/public : Laporan terverifikasi untuk Leaflet
  - POST /api/reports/submit : Formulir citizen science publik
 Endpoint Admin (Protected JWT):
  - POST  /api/admin/login       : Login admin & penerbitan token JWT
  - GET   /api/admin/reports     : Daftar semua laporan
  - PATCH /api/admin/reports/:id : Verifikasi / tolak laporan
 ==============================================================================
  `);
});
