/**
 * ==============================================================================
 * GHOST-TRACK BANTEN - ENTERPRISE MULTI-PAGE CONTROLLER
 * Shared Script: Safe DOM Verification on every page to prevent console errors
 * ==============================================================================
 */

// Global State
const GHOST_APP = {
  map: null,
  dangerZonesLayer: null,
  ghostPointsLayer: null,
  currentsLayer: null,
  layerControl: null,
  charts: {},
  threeControls: null
};

// Fallback in-memory GeoJSON datasets (ensures resilient operation under local file:// restrictions)
const FALLBACK_ZONA_BAHAYA = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "ZB-01",
        "nama": "Zona Rawan Karang P. Panjang",
        "tingkat_risiko": "Sangat Tinggi",
        "faktor": "Arus Selat Sunda & Kontur Dangkal",
        "estimasi": "45 unit jaring/tahun"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[106.140, -5.935], [106.175, -5.938], [106.180, -5.960], [106.150, -5.965], [106.135, -5.950], [106.140, -5.935]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "ZB-02",
        "nama": "Alur Pelayaran Karangantu",
        "tingkat_risiko": "Tinggi",
        "faktor": "Lalu Lintas Kapal Nelayan Padat",
        "estimasi": "38 unit bubu/tahun"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[106.150, -6.010], [106.180, -6.005], [106.185, -6.030], [106.155, -6.032], [106.150, -6.010]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "ZB-03",
        "nama": "Tubir Karang P. Lima & Pamujan",
        "tingkat_risiko": "Tinggi",
        "faktor": "Gelombang Pasang & Patahan Karang",
        "estimasi": "32 unit jaring/tahun"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[106.135, -5.990], [106.160, -5.985], [106.165, -6.010], [106.138, -6.012], [106.135, -5.990]]]
      }
    }
  ]
};

const FALLBACK_TITIK_GHOSTGEAR = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "GG-BTN-001",
        "alat": "Jaring Insang (Gillnet)",
        "kategori": "jaring",
        "kedalaman": "9 meter",
        "kondisi": "Menyelimuti Karang Acropora",
        "lokasi": "Barat Laut P. Lima",
        "status": "Prioritas Evakuasi"
      },
      "geometry": { "type": "Point", "coordinates": [106.148, -5.998] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "GG-BTN-002",
        "alat": "Bubu Lipat (Wire Trap)",
        "kategori": "bubu",
        "kedalaman": "14 meter",
        "kondisi": "Terguling di Dasar Pasir Berbatu",
        "lokasi": "Selatan P. Panjang",
        "status": "Terjadwal Pengangkatan"
      },
      "geometry": { "type": "Point", "coordinates": [106.162, -5.955] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "GG-BTN-003",
        "alat": "Potongan Jaring Monofilamen",
        "kategori": "jaring",
        "kedalaman": "6 meter",
        "kondisi": "Tersangkut Rangka Karang Buatan",
        "lokasi": "Perairan P. Semut",
        "status": "Prioritas Evakuasi"
      },
      "geometry": { "type": "Point", "coordinates": [106.143, -6.008] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "GG-BTN-004",
        "alat": "Bubu Lipat Bambu & Kawat",
        "kategori": "bubu",
        "kedalaman": "11 meter",
        "kondisi": "Tertimbun Sedimen Lumpur",
        "lokasi": "Muara Karangantu",
        "status": "Sedang Diverifikasi"
      },
      "geometry": { "type": "Point", "coordinates": [106.168, -6.018] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "GG-BTN-005",
        "alat": "Jaring Trammel Net",
        "kategori": "jaring",
        "kedalaman": "16 meter",
        "kondisi": "Gulungan Tali & Nilon ±40m",
        "lokasi": "Tengah Teluk Banten",
        "status": "Prioritas Evakuasi"
      },
      "geometry": { "type": "Point", "coordinates": [106.176, -5.975] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "GG-BTN-006",
        "alat": "Bubu Lipat Kepiting",
        "kategori": "bubu",
        "kedalaman": "7 meter",
        "kondisi": "Tersangkut Akar Mangrove",
        "lokasi": "Laguna P. Dua",
        "status": "Terjadwal Pengangkatan"
      },
      "geometry": { "type": "Point", "coordinates": [106.202, -6.012] }
    }
  ]
};

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  initNavbarMenu();
  initAnalyticsCharts();
  initCitizenScienceForm();
  initWebGISMap();
  initEcoreefViewer();
});

/* ==============================================================================
   1. NAVBAR & UI CONTROLLER (Runs safely on all pages)
   ============================================================================== */
function initNavbarMenu() {
  const hamburger = document.getElementById('navHamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = hamburger.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
  }

  // Mobile / click toggle for dropdown menus
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = toggle.closest('.nav-item-dropdown');
      if (parent) {
        parent.classList.toggle('open');
      }
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item-dropdown')) {
      document.querySelectorAll('.nav-item-dropdown.open').forEach(el => {
        el.classList.remove('open');
      });
    }
  });

  // Floating technical specification card minimization toggle
  const toggleMinBtns = document.querySelectorAll('.toggle-min-btn');
  toggleMinBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.floating-technical-card');
      if (card) {
        card.classList.toggle('minimized');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-chevron-down');
          icon.classList.toggle('fa-chevron-up');
        }
      }
    });
  });
}

/* ==============================================================================
   2. DASHBOARD ANALYTICS (Chart.js) - Safe DOM Check for index.html
   ============================================================================== */
function initAnalyticsCharts() {
  const barCanvas = document.getElementById('causesBarChart');
  const doughnutCanvas = document.getElementById('componentsDoughnutChart');

  // Strict DOM Check: only run if elements exist on current page
  if (!barCanvas && !doughnutCanvas) {
    return;
  }

  // 1. Bar Chart: Faktor Penyebab Utama
  if (barCanvas && typeof Chart !== 'undefined') {
    const ctxBar = barCanvas.getContext('2d');
    GHOST_APP.charts.causesBar = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Konflik Alat Tangkap', 'Arus Kuat', 'Pelampung Hilang', 'Tersangkut Karang'],
        datasets: [{
          label: 'Persentase Kasus (%)',
          data: [17, 11, 10, 9],
          backgroundColor: '#0d9488', // Teal Seafoam Primary
          hoverBackgroundColor: '#0f766e',
          borderColor: '#0f766e',
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0a192f',
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700' },
            bodyFont: { family: "'JetBrains Mono', monospace" },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => ` Kontribusi: ${ctx.raw}% dari total temuan`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 20,
            ticks: {
              stepSize: 5,
              callback: (v) => `${v}%`,
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              color: '#64748b'
            },
            grid: { color: '#e2e8f0', drawBorder: false }
          },
          x: {
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
              color: '#334155'
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 2. Doughnut Chart: Komponen Hilang
  if (doughnutCanvas && typeof Chart !== 'undefined') {
    const ctxDoughnut = doughnutCanvas.getContext('2d');
    GHOST_APP.charts.componentsDoughnut = new Chart(ctxDoughnut, {
      type: 'doughnut',
      data: {
        labels: ['Potongan Jaring', 'Jaring Utuh', 'Pelampung', 'Satu Set'],
        datasets: [{
          data: [22, 22, 21, 15],
          backgroundColor: [
            '#0d9488', // Teal
            '#0284c7', // Sky Blue
            '#f59e0b', // Amber
            '#64748b'  // Slate
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              padding: 14,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
              color: '#334155'
            }
          },
          tooltip: {
            backgroundColor: '#0a192f',
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700' },
            bodyFont: { family: "'JetBrains Mono', monospace" },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => ` Porsi: ${ctx.raw}%`
            }
          }
        }
      }
    });
  }
}

/* ==============================================================================
   3. CITIZEN SCIENCE FORM - Safe DOM Check for index.html
   ============================================================================== */
function initCitizenScienceForm() {
  const form = document.getElementById('citizenReportForm');
  const btnLocate = document.getElementById('btnGetLocation');
  const coordInput = document.getElementById('reportCoords');

  // Strict DOM check
  if (!form) return;

  // HTML5 Geolocation API
  if (btnLocate && coordInput) {
    btnLocate.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Browser Anda tidak mendukung layanan Geolocation HTML5.');
        return;
      }

      btnLocate.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mendeteksi...';
      btnLocate.disabled = true;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          coordInput.value = `${lat}, ${lng}`;
          btnLocate.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Dapatkan Lokasi Saya';
          btnLocate.disabled = false;
        },
        (err) => {
          btnLocate.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Dapatkan Lokasi Saya';
          btnLocate.disabled = false;
          alert('Gagal mendeteksi lokasi GPS (' + err.message + '). Silakan masukkan koordinat secara manual.');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }

  // Submit action
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('reporterName')?.value.trim();
    const gear = document.getElementById('gearType')?.value;
    const desc = document.getElementById('conditionDesc')?.value.trim();
    const coords = coordInput?.value.trim();

    if (!name || !gear || !desc || !coords) {
      alert('Mohon lengkapi seluruh formulir dan pastikan koordinat terisi.');
      return;
    }

    // Save report to localStorage for cross-page persistence
    try {
      const stored = JSON.parse(localStorage.getItem('ghost_track_citizen_reports') || '[]');
      stored.unshift({
        id: `LAPOR-${Date.now().toString().slice(-4)}`,
        name,
        gear,
        desc,
        coords,
        date: new Date().toLocaleDateString('id-ID')
      });
      localStorage.setItem('ghost_track_citizen_reports', JSON.stringify(stored));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Mandatory PRD alert
    alert('Laporan berhasil dikirim!');

    form.reset();
  });
}

/* ==============================================================================
   4. WEBGIS INTERAKTIF (Leaflet.js) - CRITICAL DOM CHECK for peta.html
   ============================================================================== */
function initWebGISMap() {
  const mapElement = document.getElementById('map');

  // CRITICAL REQUIREMENT: Check DOM element existence before initializing Leaflet
  if (!mapElement) {
    return;
  }

  if (typeof L === 'undefined') {
    console.error('Leaflet.js is not loaded.');
    return;
  }

  // Initialize Map Centered on Teluk Banten, Indonesia
  const bantenCenter = [-5.98, 106.18];
  GHOST_APP.map = L.map('map', {
    center: bantenCenter,
    zoom: 12,
    zoomControl: false,
    attributionControl: false
  });

  // Re-position zoom control to bottom right
  L.control.zoom({ position: 'bottomright' }).addTo(GHOST_APP.map);

  // Basemap 1: Esri World Imagery (Satellite - No API Key Required)
  const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
  });

  // Basemap 1 Overlay: Esri Reference Labels
  const esriLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: ''
  });

  const esriGroup = L.layerGroup([esriSatellite, esriLabels]);
  esriGroup.addTo(GHOST_APP.map);

  // Basemap 2: OpenStreetMap Standard
  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  });

  // Layer Groups for Overlays
  GHOST_APP.ghostPointsLayer = L.layerGroup().addTo(GHOST_APP.map);
  GHOST_APP.dangerZonesLayer = L.layerGroup().addTo(GHOST_APP.map);
  GHOST_APP.currentsLayer = L.layerGroup().addTo(GHOST_APP.map);

  // Native Leaflet Layer Switcher Control
  const baseMaps = {
    "Citra Satelit Esri": esriGroup,
    "OpenStreetMap": osmLayer
  };

  const overlayMaps = {
    "65 Titik ALDFG (Risk Level)": GHOST_APP.ghostPointsLayer,
    "Zona Bahaya ALDFG (Poligon)": GHOST_APP.dangerZonesLayer,
    "Dinamika Arus Laut (Grid)": GHOST_APP.currentsLayer
  };

  GHOST_APP.layerControl = L.control.layers(baseMaps, overlayMaps, {
    position: 'topright',
    collapsed: true
  }).addTo(GHOST_APP.map);

  // Load GeoJSON Data with Graceful Fallback
  loadGeoJSONData();

  // Setup Layer Checkbox Toggles for HUD Floating Panel
  setupLayerToggles();
}

function loadGeoJSONData() {
  // 1. Load 65 Ghost Gear Points (from ghostgear.js or fallback)
  if (typeof ghostGear65GeoJSON !== 'undefined' && ghostGear65GeoJSON.features) {
    renderGhostGear65(ghostGear65GeoJSON);
  } else {
    // If not loaded via script tag, attempt fetch or fallback
    fetch('ghostgear.js')
      .then(res => res.text())
      .then(() => {
        if (typeof ghostGear65GeoJSON !== 'undefined') {
          renderGhostGear65(ghostGear65GeoJSON);
        } else {
          renderGhostGear65(FALLBACK_TITIK_GHOSTGEAR);
        }
      })
      .catch(() => renderGhostGear65(FALLBACK_TITIK_GHOSTGEAR));
  }

  // 2. Fetch 'zona_bahaya.geojson'
  fetch('zona_bahaya.geojson')
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => renderDangerPolygons(data))
    .catch(err => {
      console.warn('Loading fallback danger zones:', err);
      renderDangerPolygons(FALLBACK_ZONA_BAHAYA);
    });

  // 3. Fetch 'arus.geojson' (Grid Hidrodinamika)
  fetch('arus.geojson')
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => renderCurrents(data))
    .catch(err => {
      console.warn('Currents grid not available or error:', err);
    });
}

function getRiskColor(risk) {
  switch (Number(risk)) {
    case 4:
      return '#800000'; // Dark Red / Maroon (Risiko Ekstrem)
    case 3:
      return '#ff3333'; // Bright Red (Risiko Tinggi)
    case 2:
      return '#ffa500'; // Orange (Risiko Sedang)
    case 1:
    default:
      return '#ff9999'; // Light Red / Peach (Risiko Rendah)
  }
}

function getRiskBadgeText(risk) {
  switch (Number(risk)) {
    case 4:
      return 'Level 4: Ekstrem';
    case 3:
      return 'Level 3: Tinggi';
    case 2:
      return 'Level 2: Sedang';
    case 1:
    default:
      return 'Level 1: Rendah';
  }
}

function renderGhostGear65(data) {
  GHOST_APP.ghostPointsLayer.clearLayers();

  if (!data || !data.features) return;

  data.features.forEach(feature => {
    const coords = feature.geometry.coordinates;
    const lng = coords[0];
    const lat = coords[1];
    const p = feature.properties || {};
    const risk = p.risk || 1;
    const color = getRiskColor(risk);
    const badgeText = getRiskBadgeText(risk);

    const marker = L.circleMarker([lat, lng], {
      radius: 7.5,
      fillColor: color,
      color: '#ffffff',
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.92
    });

    const popupHtml = `
      <div class="popup-data-table">
        <div class="popup-title" style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
          <span><i class="fa-solid fa-location-dot" style="color:${color};"></i> ${p.id || 'Titik ALDFG'}</span>
          <span style="background:${color}; color:#fff; font-size:0.68rem; padding:0.18rem 0.5rem; border-radius:4px; font-weight:700;">${badgeText}</span>
        </div>
        <div class="popup-row"><span>Zona Spasial:</span><strong>${p.zone || p.lokasi || 'Teluk Banten'}</strong></div>
        <div class="popup-row"><span>Tipe Alat Tangkap:</span><span>${p.type || p.alat || 'Jaring Hantu (ALDFG)'}</span></div>
        <div class="popup-row"><span>Koordinat GPS:</span><span style="font-family:var(--font-mono); font-size:0.75rem;">${lat.toFixed(4)}, ${lng.toFixed(4)}</span></div>
        ${p.kedalaman ? `<div class="popup-row"><span>Kedalaman:</span><span>${p.kedalaman}</span></div>` : ''}
        ${p.kondisi ? `<div style="margin-top:0.35rem; font-size:0.75rem; color:#64748b;">${p.kondisi}</div>` : ''}
        <div style="margin-top:0.65rem; border-top:1px solid #e2e8f0; padding-top:0.5rem; text-align:center;">
          <a href="EcoReef3D.html" class="btn-popup-upcycle">
            <i class="fa-solid fa-cubes"></i> Lihat Solusi Upcycling 3D
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    GHOST_APP.ghostPointsLayer.addLayer(marker);
  });

  // Update counter in chip
  const pointsChip = document.getElementById('countGhostPoints');
  if (pointsChip) {
    pointsChip.textContent = data.features.length;
  }
}

function renderDangerPolygons(data) {
  GHOST_APP.dangerZonesLayer.clearLayers();

  L.geoJSON(data, {
    style: {
      color: '#e11d48',
      weight: 2,
      opacity: 0.9,
      fillColor: '#e11d48',
      fillOpacity: 0.28,
      dashArray: '4, 4'
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      const html = `
        <div class="popup-data-table">
          <div class="popup-title"><i class="fa-solid fa-triangle-exclamation" style="color:#e11d48;"></i> ${p.nama || 'Zona Bahaya'}</div>
          <div class="popup-row"><span>Tingkat Risiko:</span><span style="color:#e11d48; font-weight:700;">${p.tingkat_risiko || 'Tinggi'}</span></div>
          <div class="popup-row"><span>Faktor Utama:</span><span>${p.faktor || '-'}</span></div>
          <div class="popup-row"><span>Estimasi Hilang:</span><span>${p.estimasi_kehilangan_tahunan || p.estimasi || '-'}</span></div>
          ${p.deskripsi ? `<div style="margin-top:0.35rem; font-size:0.75rem; color:#64748b;">${p.deskripsi}</div>` : ''}
          <div style="margin-top:0.65rem; border-top:1px solid #e2e8f0; padding-top:0.5rem; text-align:center;">
            <a href="EcoReef3D.html" class="btn-popup-upcycle">
              <i class="fa-solid fa-cubes"></i> Lihat Solusi Upcycling 3D
            </a>
          </div>
        </div>
      `;
      layer.bindPopup(html);
    }
  }).addTo(GHOST_APP.dangerZonesLayer);

  // Update counter in chip
  const zoneChip = document.getElementById('countDangerZones');
  if (zoneChip && data.features) {
    zoneChip.textContent = data.features.length;
  }
}

function renderCurrents(data) {
  GHOST_APP.currentsLayer.clearLayers();

  if (!data || !data.features) return;

  let activeGridCount = 0;

  L.geoJSON(data, {
    style: (feature) => {
      const p = feature.properties || {};
      const speed = p.speed_all || 0;
      const status = p.status || '';

      if (status !== 'Ada data' || speed <= 0) {
        return {
          color: 'rgba(100, 116, 139, 0.12)',
          weight: 0.5,
          fillColor: 'transparent',
          fillOpacity: 0
        };
      }

      if (speed >= 0.12) {
        return {
          color: '#0284c7',
          weight: 1,
          fillColor: '#0284c7',
          fillOpacity: 0.32
        };
      }

      return {
        color: '#0d9488',
        weight: 1,
        fillColor: '#0d9488',
        fillOpacity: 0.22
      };
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      if (p.status === 'Ada data') activeGridCount++;

      const html = `
        <div class="popup-data-table">
          <div class="popup-title"><i class="fa-solid fa-water" style="color:#0284c7;"></i> Dinamika Arus: ${p.kode || 'Grid'}</div>
          <div class="popup-row"><span>Kecepatan Rata-rata:</span><strong>${(p.speed_all || 0).toFixed(4)} m/s</strong></div>
          <div class="popup-row"><span>Musim Barat:</span><span>${p.speed_barat !== null && p.speed_barat !== undefined ? Number(p.speed_barat).toFixed(4) + ' m/s' : '-'}</span></div>
          <div class="popup-row"><span>Musim Timur:</span><span>${p.speed_timur !== null && p.speed_timur !== undefined ? Number(p.speed_timur).toFixed(4) + ' m/s' : '-'}</span></div>
          <div class="popup-row"><span>Arah Hanyutan:</span><span>${p.arah_deg || 0}&deg;</span></div>
          <div class="popup-row"><span>Status Data:</span><span style="color:#0284c7;">${p.status || '-'}</span></div>
        </div>
      `;
      layer.bindPopup(html);
    }
  }).addTo(GHOST_APP.currentsLayer);

  const currentsChip = document.getElementById('countCurrents');
  if (currentsChip) {
    currentsChip.textContent = activeGridCount;
  }
}

function setupLayerToggles() {
  const chkZones = document.getElementById('toggleDangerZones');
  const chkPoints = document.getElementById('toggleGhostPoints');
  const chkCurrents = document.getElementById('toggleCurrents');

  if (chkZones) {
    chkZones.addEventListener('change', (e) => {
      if (e.target.checked) GHOST_APP.map.addLayer(GHOST_APP.dangerZonesLayer);
      else GHOST_APP.map.removeLayer(GHOST_APP.dangerZonesLayer);
    });
  }

  if (chkPoints) {
    chkPoints.addEventListener('change', (e) => {
      if (e.target.checked) GHOST_APP.map.addLayer(GHOST_APP.ghostPointsLayer);
      else GHOST_APP.map.removeLayer(GHOST_APP.ghostPointsLayer);
    });
  }

  if (chkCurrents) {
    chkCurrents.addEventListener('change', (e) => {
      if (e.target.checked) GHOST_APP.map.addLayer(GHOST_APP.currentsLayer);
      else GHOST_APP.map.removeLayer(GHOST_APP.currentsLayer);
    });
  }
}

/* ==============================================================================
   5. 3D ECOREEF VIEWER & FALLBACK - Safe DOM Check for EcoReef3D.html
   ============================================================================== */
function initEcoreefViewer() {
  const viewer = document.getElementById('ecoreefViewer');
  const fallbackCanvas = document.getElementById('threejs-ecoreef-fallback');

  // Strict DOM check
  if (!viewer) return;

  // Handle fallback if <model-viewer> cannot reach the GLB
  viewer.addEventListener('error', () => {
    console.warn('model-viewer error. Activating Three.js procedural fallback.');
    activateThreeJsFallback();
  });

  const loadTimeout = setTimeout(() => {
    if (!viewer.loaded) {
      console.info('model-viewer still pending, readying Three.js fallback.');
    }
  }, 4000);

  viewer.addEventListener('load', () => {
    clearTimeout(loadTimeout);
  });

  // Global camera preset function
  window.setViewerCamera = function(view) {
    if (viewer && viewer.style.display !== 'none') {
      if (view === 'front') viewer.cameraOrbit = '0deg 75deg 2.5m';
      else if (view === 'top') viewer.cameraOrbit = '0deg 0deg 3.2m';
      else if (view === 'iso') viewer.cameraOrbit = '45deg 55deg 2.8m';
    } else if (GHOST_APP.threeControls) {
      if (view === 'front') GHOST_APP.threeControls.object.position.set(0, 0, 3);
      else if (view === 'top') GHOST_APP.threeControls.object.position.set(0, 4, 0.1);
      else if (view === 'iso') GHOST_APP.threeControls.object.position.set(2.5, 2, 2.5);
      GHOST_APP.threeControls.update();
    }
  };
}

function activateThreeJsFallback() {
  const viewer = document.getElementById('ecoreefViewer');
  const fallbackCanvas = document.getElementById('threejs-ecoreef-fallback');
  if (!fallbackCanvas) return;

  if (viewer) viewer.style.display = 'none';
  fallbackCanvas.style.display = 'block';

  if (typeof THREE === 'undefined') return;

  const width = fallbackCanvas.parentElement.clientWidth;
  const height = 500;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(3, 2.5, 3.5);

  const renderer = new THREE.WebGLRenderer({ canvas: fallbackCanvas, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);

  let controls = null;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    GHOST_APP.threeControls = controls;
  }

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  // Ecoreef Modular Structure
  const group = new THREE.Group();
  const pvcBlue = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
  const pvcGreen = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.3 });
  const netMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.45 });
  const coralMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.6 });

  const radius = 1.2;
  const segs = 8;
  const bottomPoints = [];
  const topPoints = [];

  for (let i = 0; i < segs; i++) {
    const angle = (i / segs) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    bottomPoints.push(new THREE.Vector3(x, -0.6, z));
    topPoints.push(new THREE.Vector3(x, 0.4, z));

    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
    const post = new THREE.Mesh(postGeo, pvcBlue);
    post.position.set(x, -0.1, z);
    group.add(post);
  }

  for (let i = 0; i < segs; i++) {
    const next = (i + 1) % segs;
    addCyl(bottomPoints[i], bottomPoints[next], pvcBlue, group);
    addCyl(topPoints[i], topPoints[next], pvcGreen, group);

    const peak = new THREE.Vector3(0, 1.2, 0);
    addCyl(topPoints[i], peak, pvcBlue, group);
  }

  const netGeo = new THREE.CylinderGeometry(radius, radius, 1.0, segs, 3, true);
  const netMesh = new THREE.Mesh(netGeo, netMat);
  netMesh.position.y = -0.1;
  group.add(netMesh);

  // Door
  const doorGeo = new THREE.TorusGeometry(0.35, 0.04, 12, 24);
  const door = new THREE.Mesh(doorGeo, pvcBlue);
  door.position.set(0, -0.2, radius);
  group.add(door);

  // Corals
  for (let i = 0; i < 6; i++) {
    const coralGeo = new THREE.DodecahedronGeometry(0.12, 1);
    const coral = new THREE.Mesh(coralGeo, coralMat);
    const angle = (i / 6) * Math.PI * 2;
    coral.position.set(Math.cos(angle) * 1.15, -0.3 + (i % 2) * 0.4, Math.sin(angle) * 1.15);
    group.add(coral);
  }

  scene.add(group);

  function addCyl(v1, v2, mat, parent) {
    const dist = v1.distanceTo(v2);
    const geo = new THREE.CylinderGeometry(0.04, 0.04, dist, 8);
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(v1).lerp(v2, 0.5);
    m.lookAt(v2);
    m.rotateX(Math.PI / 2);
    parent.add(m);
  }

  function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.005;
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const newW = fallbackCanvas.parentElement.clientWidth;
    camera.aspect = newW / height;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, height);
  });
}
