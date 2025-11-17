"use client";

import { useEffect, useRef, useState } from "react";

export default function MapaViajesTransportista({ viajes }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.L) {
      setLeafletLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    
    const map = L.map(mapRef.current).setView([40.4168, -3.7038], 6);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current || !viajes?.length) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    viajes.forEach((viaje) => {
      // Add route if available
      if (viaje.ruta_completa && Array.isArray(viaje.ruta_completa)) {
        const latlngs = viaje.ruta_completa.map(coord => [coord.lat, coord.lng]);
        L.polyline(latlngs, { color: '#3b82f6', weight: 4, opacity: 0.7 }).addTo(map);
      }

      // Add origin marker
      if (viaje.origen_lat && viaje.origen_lon) {
        L.marker([viaje.origen_lat, viaje.origen_lon], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>'
          })
        }).addTo(map).bindPopup(`<b>Origen:</b> ${viaje.origen}`);
      }

      // Add destination marker
      if (viaje.destino_lat && viaje.destino_lon) {
        L.marker([viaje.destino_lat, viaje.destino_lon], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>'
          })
        }).addTo(map).bindPopup(`<b>Destino:</b> ${viaje.destino}`);
      }

      // Add current location marker
      if (viaje.ubicacion_actual_lat && viaje.ubicacion_actual_lon) {
        L.marker([viaje.ubicacion_actual_lat, viaje.ubicacion_actual_lon], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>'
          })
        }).addTo(map).bindPopup(`<b>Ubicación Actual</b><br>Viaje #${viaje.id}`);
      }
    });

    if (viajes.length > 0) {
      const bounds = [];
      viajes.forEach(viaje => {
        if (viaje.origen_lat && viaje.origen_lon) bounds.push([viaje.origen_lat, viaje.origen_lon]);
        if (viaje.destino_lat && viaje.destino_lon) bounds.push([viaje.destino_lat, viaje.destino_lon]);
      });
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [leafletLoaded, viajes]);

  if (!leafletLoaded) {
    return (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  return <div ref={mapRef} className="h-96 rounded-lg border border-border" />;
}
