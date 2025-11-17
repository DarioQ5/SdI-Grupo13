"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Truck, MapPin, Package, Award, Leaf, Navigation } from 'lucide-react';
import { apiClient } from "@/lib/api";
import { MobileNav } from "@/components/mobile-nav";

export default function TransportistaPerfil() {
  const router = useRouter();
  const [transportista, setTransportista] = useState(null);
  const [disponible, setDisponible] = useState(false);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [rastreandoUbicacion, setRastreandoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      const transportistaData = localStorage.getItem("transportista");
      if (!transportistaData) {
        router.push("/transportista/login");
        return;
      }

      const t = JSON.parse(transportistaData);
      setTransportista(t);
      setDisponible(t.disponible);
      
      if (t.ubicacion_actual_lat && t.ubicacion_actual_lon) {
        setUbicacionActual({
          lat: t.ubicacion_actual_lat,
          lng: t.ubicacion_actual_lon
        });
      }
      
      try {
        const ordenesData = await apiClient.getOrdenes({ 
          estado: "publicada" 
        });
        
        const ofertasRelevantes = ordenesData.filter(orden => {
          return !orden.transportista_asignado_id || 
                 orden.transportista_asignado_id === t.id;
        }).slice(0, 5);
        
        setOfertas(ofertasRelevantes);
      } catch (error) {
        console.error("[v0] Error cargando ofertas:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [router]);

  const obtenerUbicacionGPS = () => {
    if (!navigator.geolocation) {
      setErrorUbicacion("Tu navegador no soporta geolocalización");
      return;
    }

    setRastreandoUbicacion(true);
    setErrorUbicacion(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log("[v0] GPS Location obtained:", latitude, longitude);
        
        setUbicacionActual({ lat: latitude, lng: longitude });
        
        try {
          await apiClient.request(`/api/transportistas/${transportista.id}/ubicacion`, {
            method: "PUT",
            body: JSON.stringify({
              ubicacion_actual_lat: latitude,
              ubicacion_actual_lon: longitude
            })
          });
          
          const transportistaActualizado = {
            ...transportista,
            ubicacion_actual_lat: latitude,
            ubicacion_actual_lon: longitude
          };
          localStorage.setItem("transportista", JSON.stringify(transportistaActualizado));
          setTransportista(transportistaActualizado);
          
          alert("Ubicación actualizada correctamente!");
        } catch (error) {
          console.error("[v0] Error updating location:", error);
          setErrorUbicacion("Error al guardar ubicación");
        } finally {
          setRastreandoUbicacion(false);
        }
      },
      (error) => {
        console.error("[v0] GPS Error:", error);
        setRastreandoUbicacion(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorUbicacion("Permiso de ubicación denegado. Por favor, habilita la ubicación en tu navegador.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorUbicacion("Ubicación no disponible.");
            break;
          case error.TIMEOUT:
            setErrorUbicacion("Tiempo de espera agotado al obtener ubicación.");
            break;
          default:
            setErrorUbicacion("Error desconocido al obtener ubicación.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const toggleDisponibilidad = async () => {
    if (!transportista) return;
    
    const nuevoEstado = !disponible;
    
    try {
      await apiClient.updateDisponibilidad(transportista.id, nuevoEstado);
      
      setDisponible(nuevoEstado);
      const transportistaActualizado = { ...transportista, disponible: nuevoEstado };
      localStorage.setItem("transportista", JSON.stringify(transportistaActualizado));
      setTransportista(transportistaActualizado);
    } catch (error) {
      console.error("[v0] Error actualizando disponibilidad:", error);
      alert("Error al actualizar disponibilidad");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("transportista");
    router.push("/");
  };

  const aceptarOferta = async (ordenId) => {
    try {
      await apiClient.updateEstadoOrden(ordenId, "aceptada", transportista.id);
      alert(`Oferta aceptada!`);
      setOfertas(ofertas.filter(o => o.id !== ordenId));
    } catch (error) {
      console.error("[v0] Error aceptando oferta:", error);
      alert(error.message || "Error al aceptar oferta. Puede que ya tengas 2 ofertas aceptadas.");
    }
  };

  const rechazarOferta = async (ordenId) => {
    try {
      await apiClient.updateEstadoOrden(ordenId, "rechazada");
      setOfertas(ofertas.filter(o => o.id !== ordenId));
    } catch (error) {
      console.error("[v0] Error rechazando oferta:", error);
      alert("Error al rechazar oferta");
    }
  };

  if (loading || !transportista) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-accent" />
            <div>
              <h1 className="font-semibold text-lg">{transportista.nombre || `Transportista ${transportista.id}`}</h1>
              <p className="text-xs text-muted-foreground">
                {transportista.camion?.tipo_camion || "Camión"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                Ubicación GPS Actual
              </h2>
              {ubicacionActual ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    📍 Lat: {ubicacionActual.lat.toFixed(6)}, Lng: {ubicacionActual.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tu ubicación está siendo rastreada y visible para proveedores
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Activa el GPS para que los proveedores puedan ver tu ubicación real en el mapa
                </p>
              )}
              {errorUbicacion && (
                <p className="text-sm text-red-600 mt-2">⚠️ {errorUbicacion}</p>
              )}
            </div>
            <Button
              onClick={obtenerUbicacionGPS}
              size="lg"
              variant="default"
              disabled={rastreandoUbicacion}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {rastreandoUbicacion ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Obteniendo...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  {ubicacionActual ? "Actualizar GPS" : "Activar GPS"}
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Estado de Disponibilidad</h2>
              <p className="text-muted-foreground">
                {disponible 
                  ? "Estás visible para proveedores y puedes recibir ofertas" 
                  : "No estás visible para proveedores"}
              </p>
            </div>
            <Button
              onClick={toggleDisponibilidad}
              size="lg"
              variant={disponible ? "default" : "outline"}
              className={disponible ? "bg-success hover:bg-success/90" : ""}
            >
              {disponible ? "✓ Disponible" : "Ponerme Disponible"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Mi Perfil</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Camión</p>
                <p className="font-medium">{transportista.camion?.tipo_camion || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Capacidad</p>
                <p className="font-medium">{transportista.camion?.capacidad_kg || 0} kg</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Combustible</p>
                <p className="font-medium">{transportista.camion?.combustible || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Reputación</p>
                <p className="font-medium">⭐ {transportista.reputacion}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Frigorífico</p>
                <p className="font-medium">
                  {transportista.camion?.reefer ? "Sí" : "No"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Leaf className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Emisiones CO₂ Total</p>
                <p className="font-medium">{transportista.emisiones_co2_total?.toFixed(0) || 0} kg</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Viajes Completados</p>
            <p className="text-2xl font-bold text-primary">{transportista.viajes_completados || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Reputación</p>
            <p className="text-2xl font-bold text-accent">⭐ {transportista.reputacion || 5.0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">CO₂ por Viaje</p>
            <p className="text-2xl font-bold text-success">
              {transportista.viajes_completados > 0 
                ? (transportista.emisiones_co2_total / transportista.viajes_completados).toFixed(1)
                : 0} kg
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Ofertas Disponibles ({ofertas.length})</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/transportista/ofertas')}
            >
              Ver Todas
            </Button>
          </div>
          {ofertas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tienes ofertas pendientes
            </p>
          ) : (
            <div className="space-y-4">
              {ofertas.map((oferta) => (
                <Card key={oferta.id} className="p-4 border-2">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          {oferta.origen} → {oferta.destino}
                        </span>
                        <span className="text-sm px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
                          {oferta.precio}€
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {oferta.tipo_carga} - {oferta.peso_kg} kg
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-muted">
                          📍 {oferta.distancia_km} km
                        </span>
                        {oferta.ventana_desde && (
                          <span className="px-2 py-1 rounded bg-muted">
                            📅 {new Date(oferta.ventana_desde).toLocaleDateString()}
                          </span>
                        )}
                        {oferta.req_reefer && (
                          <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                            🥶 Requiere frío
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 sm:flex-none bg-success hover:bg-success/90"
                        onClick={() => aceptarOferta(oferta.id)}
                      >
                        Aceptar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() => rechazarOferta(oferta.id)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      <MobileNav tipo="transportista" />
    </div>
  );
}
