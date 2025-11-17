"use client";

import { useEffect, useRef, useState } from "react";

export default function MapaViajesContratados({ viajes, onViajeClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    const checkLeaflet = () => {
      if (typeof window !== 'undefined' && window.L) {
        setLeafletLoaded(true);
      } else {
        setTimeout(checkLeaflet, 100);
      }
    };
    checkLeaflet();
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !leafletLoaded || !window.L) return;

    const L = window.L;
    const map = L.map(mapRef.current).setView([40.4168, -3.7038], 6);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !viajes || !leafletLoaded || !window.L) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    viajes.forEach((viaje) => {
      const rutaCoordenadas = viaje.rutaCompleta.map(punto => [punto.lat, punto.lng]);
      L.polyline(rutaCoordenadas, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.6,
        dashArray: '10, 5'
      }).addTo(map);

      const puntoActualIndex = Math.floor((viaje.progreso / 100) * (viaje.rutaCompleta.length - 1));
      const rutaRecorrida = viaje.rutaCompleta.slice(0, puntoActualIndex + 1);
      if (rutaRecorrida.length > 1) {
        rutaRecorrida.push([viaje.ubicacionActual.lat, viaje.ubicacionActual.lng]);
        L.polyline(rutaRecorrida, {
          color: '#22c55e',
          weight: 5,
          opacity: 0.8
        }).addTo(map);
      }

      const origenIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: #22c55e;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const markerOrigen = L.marker([viaje.origen.lat, viaje.origen.lng], { icon: origenIcon });
      markerOrigen.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <strong style="color: #22c55e;">ORIGEN</strong><br/>
          <strong>${viaje.origen.nombre}</strong><br/>
          <span style="font-size: 12px; color: #666;">
            Inicio: ${new Date(viaje.horaInicio).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      `);
      markerOrigen.addTo(map);

      const destinoIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: #ef4444;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const markerDestino = L.marker([viaje.destino.lat, viaje.destino.lng], { icon: destinoIcon });
      markerDestino.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <strong style="color: #ef4444;">DESTINO</strong><br/>
          <strong>${viaje.destino.nombre}</strong><br/>
          <span style="font-size: 12px; color: #666;">
            ETA: ${new Date(viaje.horaEstimadaLlegada).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      `);
      markerDestino.addTo(map);

      const camionIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: #3b82f6;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
            cursor: pointer;
          ">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M18 18.5a1.5 1.5 0 01-1.5-1.5 1.5 1.5 0 011.5-1.5 1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-1.5 1.5m1.5-9l1.96 2.5H17V9.5m-11 9A1.5 1.5 0 014.5 17 1.5 1.5 0 016 15.5 1.5 1.5 0 017.5 17 1.5 1.5 0 016 18.5M20 8h-3V4H3c-1.11 0-2 .89-2 2v11h2a3 3 0 003 3 3 3 0 003-3h6a3 3 0 003 3 3 3 0 003-3h2v-5l-3-4z"/>
            </svg>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          </style>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const markerCamion = L.marker([viaje.ubicacionActual.lat, viaje.ubicacionActual.lng], { icon: camionIcon });
      
      const minutosTranscurridos = Math.floor(viaje.tiempoTranscurrido / 60);
      const horasTranscurridas = Math.floor(minutosTranscurridos / 60);
      const minutosRestantes = minutosTranscurridos % 60;
      const tiempoTexto = horasTranscurridas > 0 
        ? `${horasTranscurridas}h ${minutosRestantes}min` 
        : `${minutosTranscurridos}min`;

      markerCamion.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <strong style="color: #3b82f6; font-size: 14px;">CAMIÓN EN TRÁNSITO</strong><br/>
          <span style="font-size: 12px; color: #666;">
            <strong>Progreso:</strong> ${viaje.progreso}%<br/>
            <strong>Recorrido:</strong> ${viaje.distanciaRecorrida.toFixed(1)} / ${viaje.distancia} km<br/>
            <strong>Tiempo:</strong> ${tiempoTexto}<br/>
            <strong>ETA:</strong> ${Math.round(viaje.etaMinutos)} min<br/>
            ${viaje.detenido ? `<strong style="color: #ef4444;">⚠️ DETENIDO (${viaje.tiempoDetenido} min)</strong>` : '<strong style="color: #22c55e;">✓ En movimiento</strong>'}
          </span>
        </div>
      `);

      markerCamion.on("click", () => {
        if (onViajeClick) {
          onViajeClick(viaje);
        }
      });

      markerCamion.addTo(map);

      if (rutaCoordenadas.length > 0) {
        const bounds = L.latLngBounds(rutaCoordenadas);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });
  }, [viajes, onViajeClick, leafletLoaded]);

  if (!leafletLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: "500px" }}
    />
  );
}
