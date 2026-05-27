import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import MobileNav from '../components/layout/MobileNav';

// Mock incidents with GPS coordinates near Barangay 45, Pasay City
const MOCK_INCIDENTS = [
  { id: 'RC-9921', lat: 14.5547, lng: 121.0140, type: 'Cardiac Arrest',      severity: 5, status: 'DISPATCHED' },
  { id: 'RC-8812', lat: 14.5510, lng: 121.0180, type: 'Vehicular Accident',   severity: 4, status: 'IN ROUTE'  },
  { id: 'RC-7705', lat: 14.5590, lng: 121.0200, type: 'Respiratory Distress', severity: 3, status: 'PENDING'   },
  { id: 'RC-6540', lat: 14.5525, lng: 121.0155, type: 'Minor Laceration',     severity: 2, status: 'ON-SCENE'  },
];

const SEVERITY_COLORS = {
  5: '#e53935',
  4: '#fb8c00',
  3: '#fdd835',
  2: '#b8c4ff',
  1: '#43a047',
};

export default function MapPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    // Dynamically load Leaflet to avoid SSR issues
    if (leafletMapRef.current) return;

    import('leaflet').then((L) => {
      // Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const map = L.map(mapRef.current, {
        center: [14.5547, 121.0180],
        zoom: 15,
        zoomControl: true,
      });

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Add incident markers
      MOCK_INCIDENTS.forEach(incident => {
        const color = SEVERITY_COLORS[incident.severity];

        // Custom SVG marker
        const markerHtml = `
          <div style="
            width: 32px; height: 32px;
            background: ${color}25;
            border: 2px solid ${color};
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 12px ${color}60;
            ${incident.severity === 5 ? 'animation: pulse 1.5s infinite;' : ''}
          ">
            <div style="width:10px;height:10px;background:${color};border-radius:50%;"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([incident.lat, incident.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="background:#171717;border:1px solid rgba(255,255,255,0.1);padding:10px;border-radius:6px;min-width:160px;">
              <div style="color:${color};font-size:9px;font-family:monospace;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">
                SEV-${incident.severity} — ${incident.status}
              </div>
              <div style="color:#e5e2e1;font-size:12px;font-weight:bold;margin-bottom:2px;">${incident.id}</div>
              <div style="color:#8e909f;font-size:11px;">${incident.type}</div>
            </div>
          `, {
            className: 'respondacare-popup',
          });
      });

      // Add Barangay 45 center marker
      const brgyIcon = L.divIcon({
        html: `<div style="width:40px;height:40px;background:#1e3fae20;border:2px solid #1e3fae;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;">🏢</div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([14.5547, 121.0244], { icon: brgyIcon })
        .addTo(map)
        .bindPopup('<div style="color:#b8c4ff;font-family:monospace;font-size:11px;">Barangay 45 ERU HQ</div>');

      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const sessionRaw = localStorage.getItem('respondaCare_session');
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  const isResponder = session?.role === 'responder';

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col pb-16">
      <header className="bg-[#0e0e0e] border-b border-white/[0.07] px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(isResponder ? '/responder/scanner' : '/admin/dashboard')}
          className="text-[#8e909f] hover:text-[#e5e2e1]"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold text-[#e5e2e1]">GIS Dispatch Map</h1>
          <p className="text-[10px] font-mono text-[#8e909f] uppercase tracking-widest">
            {MOCK_INCIDENTS.length} Active Incidents
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Legend Overlay */}
        <div className="absolute top-3 right-3 z-[1000] bg-[#0e0e0e]/90 backdrop-blur border border-white/10 rounded-lg p-3 space-y-1.5">
          <p className="text-[8px] font-mono text-[#444653] tracking-widest uppercase mb-2">Severity</p>
          {Object.entries(SEVERITY_COLORS).reverse().map(([sev, color]) => (
            <div key={sev} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-[9px] font-mono text-[#8e909f]">
                {sev === '5' ? 'Critical' : sev === '4' ? 'High' : sev === '3' ? 'Moderate' : sev === '2' ? 'Low' : 'Minimal'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div className="flex-shrink-0 bg-[#0e0e0e] border-t border-white/[0.07] max-h-48 overflow-y-auto">
        {MOCK_INCIDENTS.map(incident => (
          <div
            key={incident.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02]"
          >
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ background: SEVERITY_COLORS[incident.severity], boxShadow: `0 0 6px ${SEVERITY_COLORS[incident.severity]}80` }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-bold text-[#e5e2e1]">{incident.id}</p>
              <p className="text-[10px] text-[#8e909f] truncate">{incident.type}</p>
            </div>
            <span className="text-[9px] font-mono text-[#444653] flex-shrink-0">
              {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
            </span>
          </div>
        ))}
      </div>

      <MobileNav />
    </div>
  );
}
