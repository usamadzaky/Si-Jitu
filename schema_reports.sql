-- ==============================================================================
-- GHOST-TRACK Banten - Supabase SQL Schema for 'reports' table
-- Jalankan query ini di SQL Editor pada Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/uusqvsjwgvowgcdmacsw/sql
-- ==============================================================================

-- 1. Buat Tabel 'reports'
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    gear_type TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    reporter_name TEXT NOT NULL,
    contact_num TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    risk_level INTEGER DEFAULT 1 CHECK (risk_level BETWEEN 1 AND 4),
    admin_notes TEXT
);

-- 2. Buat Index untuk performa query spasial & status
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_coords ON public.reports (latitude, longitude);

-- 3. Konfigurasi Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy A: Publik dapat membaca laporan yang berstatus 'verified'
CREATE POLICY "Public Read Verified Reports"
    ON public.reports
    FOR SELECT
    TO anon, authenticated
    USING (status = 'verified');

-- Policy B: Publik dapat mengajukan laporan baru dengan status 'pending'
CREATE POLICY "Public Submit Pending Reports"
    ON public.reports
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (status = 'pending');

-- Policy C: Service Role (Backend Node.js) memiliki akses penuh
CREATE POLICY "Service Role Full Access"
    ON public.reports
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. Sample Data Awal (Opsional untuk testing)
INSERT INTO public.reports (gear_type, latitude, longitude, description, reporter_name, contact_num, photo_url, status, risk_level, admin_notes)
VALUES 
    ('Jaring Rajungan (Gillnet)', -5.9680, 106.1820, 'Jaring monofilamen terdampar di terumbu karang dangkal dekat Pulau Lima.', 'Pak Sulaeman (Nelayan Karangantu)', '081234567890', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', 'verified', 3, 'Telah divalidasi tim riset lapangan.'),
    ('Bubu Lipat (Wire Trap)', -6.0025, 106.1650, 'Dua unit bubu kawat tertimbun pasir & lumpur di alur kapal.', 'H. Dahlan (Nahkoda KM Bahari)', '081987654321', 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80', 'pending', 2, NULL)
ON CONFLICT DO NOTHING;
