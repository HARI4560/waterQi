import { useEffect, useRef } from 'react';
import { getCategoryFromWQI } from '../../utils/wqiHelpers';

export default function WQIMap({ waterBodies }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!waterBodies || waterBodies.length === 0 || !mapRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current, {
        center: [13.0, 76.5], zoom: 7, zoomControl: true, attributionControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO', maxZoom: 18
      }).addTo(map);

      waterBodies.forEach(wb => {
        if (!wb.latitude || !wb.longitude) return;
        const wqi = wb.wqi || wb.latestWQI || 0;
        const catInfo = getCategoryFromWQI(wqi);

        const icon = L.divIcon({
          className: 'wqi-map-marker',
          html: `<div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${catInfo.color};box-shadow:0 0 10px ${catInfo.color};cursor:pointer;transition:transform 0.2s"><span style="color:#000;font-weight:800;font-size:10px">${wqi}</span></div>`,
          iconSize: [36, 36], iconAnchor: [18, 18]
        });

        const marker = L.marker([wb.latitude, wb.longitude], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:180px">
            <strong style="font-size:14px">${wb.name}</strong><br/>
            <span style="color:#888;font-size:12px">${wb.city} • ${wb.type}</span><br/>
            <div style="margin-top:8px;font-size:20px;font-weight:800;color:${catInfo.color}">${wqi} <small style="font-size:11px;color:#aaa">WQI</small></div>
            <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${catInfo.bg};color:${catInfo.color}">${catInfo.label}</span>
          </div>
        `, { className: 'wqi-popup' });
      });

      mapInstanceRef.current = map;

      const validBodies = waterBodies.filter(wb => wb.latitude && wb.longitude);
      if (validBodies.length > 0) {
        const bounds = L.latLngBounds(validBodies.map(wb => [wb.latitude, wb.longitude]));
        map.fitBounds(bounds.pad(0.1));
      }
    };

    initMap();
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [waterBodies]);

  return (
    <div className="glass-card map-card" style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
      <div className="section-header map-header">
        <h2 className="section-title"><span>🗺️</span> KSPCB Mapping</h2>
        <span className="title-pulse-dot"></span>
      </div>
      <div className="map-container-wrapper">
        <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
      </div>
    </div>
  );
}
