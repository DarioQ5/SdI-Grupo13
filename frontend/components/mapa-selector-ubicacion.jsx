"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from 'lucide-react';

export default function MapaSelectorUbicacion({ onUbicacionSeleccionada, ubicacionInicial, tipo = "ubicacion" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [ubicacionActual, setUbicacionActual] = useState(ubicacionInicial);
  const [busqueda, setBusqueda] = useState("");

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
    const center = ubicacionInicial || { lat: 40.4168, lng: -3.7038 }; // Madrid por defecto
    const map = L.map(mapRef.current).setView([center.lat, center.lng], ubicacionInicial ? 13 : 6);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Crear marcador inicial si hay ubicación
    if (ubicacionInicial) {
      const markerColor = tipo === "origen" ? "#22c55e" : "#ef4444";
      const markerIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${markerColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-center: center;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      
      markerRef.current = L.marker([ubicacionInicial.lat, ubicacionInicial.lng], { 
        icon: markerIcon,
        draggable: true 
      });
      markerRef.current.addTo(map);
      
      markerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setUbicacionActual({ lat: pos.lat, lng: pos.lng });
      });
    }

    // Permitir hacer clic en el mapa para colocar marcador
    map.on('click', (e) => {
      const markerColor = tipo === "origen" ? "#22c55e" : "#ef4444";
      const markerIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${markerColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      
      markerRef.current = L.marker([e.latlng.lat, e.latlng.lng], { 
        icon: markerIcon,
        draggable: true 
      });
      markerRef.current.addTo(map);
      
      markerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setUbicacionActual({ lat: pos.lat, lng: pos.lng });
      });
      
      setUbicacionActual({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, tipo]);

  const buscarLugar = async () => {
    if (!busqueda.trim()) return;
    
    try {
      // Usar Nominatim de OpenStreetMap para geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const ubicacion = { lat: parseFloat(lat), lng: parseFloat(lon) };
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([ubicacion.lat, ubicacion.lng], 13);
          
          const L = window.L;
          const markerColor = tipo === "origen" ? "#22c55e" : "#ef4444";
          const markerIcon = L.divIcon({
            className: "custom-marker",
            html: `
              <div style="
                background-color: ${markerColor};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });

          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
          }
          
          markerRef.current = L.marker([ubicacion.lat, ubicacion.lng], { 
            icon: markerIcon,
            draggable: true 
          });
          markerRef.current.addTo(mapInstanceRef.current);
          
          markerRef.current.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            setUbicacionActual({ lat: pos.lat, lng: pos.lng });
          });
          
          setUbicacionActual(ubicacion);
        }
      } else {
        alert("No se encontró la ubicación. Intenta con otro nombre.");
      }
    } catch (error) {
      console.error("[v0] Error buscando ubicación:", error);
      alert("Error al buscar la ubicación");
    }
  };

  const confirmarSeleccion = () => {
    if (ubicacionActual) {
      onUbicacionSeleccionada(ubicacionActual);
    } else {
      alert("Por favor selecciona una ubicación en el mapa");
    }
  };

  if (!leafletLoaded) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar ciudad, dirección o lugar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && buscarLugar()}
        />
        <Button onClick={buscarLugar} type="button">
          Buscar
        </Button>
      </div>

      <div 
        ref={mapRef} 
        className="w-full rounded-lg border border-border"
        style={{ height: "500px" }}
      />

      {ubicacionActual && (
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Ubicación seleccionada:</p>
          <p className="text-sm text-muted-foreground">
            Latitud: {ubicacionActual.lat.toFixed(6)}
          </p>
          <p className="text-sm text-muted-foreground">
            Longitud: {ubicacionActual.lng.toFixed(6)}
          </p>
        </div>
      )}

      <Button 
        className="w-full" 
        onClick={confirmarSeleccion}
        disabled={!ubicacionActual}
        type="button"
      >
        <MapPin className="mr-2 h-4 w-4" />
        Confirmar {tipo === "origen" ? "Origen" : "Destino"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Haz clic en el mapa para seleccionar una ubicación, o busca por nombre y ajusta arrastrando el marcador
      </p>
    </div>
  );
}
