"use client";

import { useEffect, useRef, useState } from "react";

function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getMarkerColor(transportista, distanciaKm) {
  if (!transportista.disponible) {
    if (transportista.tiempoDesocupacion <= 2) {
      return "#f97316";
    }
    return "#ef4444";
  }
  
  if (distanciaKm < 10) {
    return "#22c55e";
  } else if (distanciaKm < 50) {
    return "#eab308";
  }
  
  return "#f97316";
}

export default function MapaTransportistas({ transportistas, onTransportistaClick, centroMapa = [40.4168, -3.7038] }) {
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
    const map = L.map(mapRef.current).setView(centroMapa, 11);
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
  }, [leafletLoaded, centroMapa]);

  useEffect(() => {
    if (!mapInstanceRef.current || !transportistas || !leafletLoaded || !window.L) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    transportistas.forEach((transportista) => {
      const distancia = calcularDistancia(
        centroMapa[0],
        centroMapa[1],
        transportista.ubicacion.lat,
        transportista.ubicacion.lng
      );

      const color = getMarkerColor(transportista, distancia);

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h-2v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([transportista.ubicacion.lat, transportista.ubicacion.lng], { icon });

      const estadoTexto = transportista.disponible ? "Disponible" : `Ocupado (${transportista.tiempoDesocupacion}h)`;

      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <strong style="font-size: 14px;">${transportista.nombre}</strong><br/>
          <span style="font-size: 12px; color: #666;">
            ${transportista.tipoCamion} - ${transportista.capacidad}kg<br/>
            ${transportista.equipoFrigorifico ? "🥶 Frigorífico" : "📦 Sin frío"}<br/>
            ⭐ ${transportista.reputacion} (${transportista.viajesCompletados} viajes)<br/>
            📍 ${distancia.toFixed(1)} km<br/>
            <strong style="color: ${color};">${estadoTexto}</strong>
          </span>
        </div>
      `);

      marker.on("click", () => {
        if (onTransportistaClick) {
          onTransportistaClick(transportista);
        }
      });

      marker.addTo(map);
    });
  }, [transportistas, centroMapa, onTransportistaClick, leafletLoaded]);

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
      style={{ minHeight: "400px" }}
    />
  );
}
