"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, MapPin, Package, Navigation, CheckCircle } from 'lucide-react';
import { apiClient } from "@/lib/api";
import { MobileNav } from "@/components/mobile-nav";

// const MapaViajes = dynamic(() => import('@/components/mapa-viajes-transportista'), { 
//   ssr: false,
//   loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
// });

export default function TransportistaViajes() {
  const router = useRouter();
  const [transportista, setTransportista] = useState(null);
  const [viajesEnProgreso, setViajesEnProgreso] = useState([]);
  const [viajesEntregados, setViajesEntregados] = useState([]);
  const [viajesCompletados, setViajesCompletados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geolocalizacionActiva, setGeolocalizacionActiva] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [procesandoEntrega, setProcesandoEntrega] = useState(null);

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 30000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const cargarDatos = async () => {
    const transportistaData = localStorage.getItem("transportista");
    if (!transportistaData) {
      router.push("/transportista/login");
      return;
    }

    const t = JSON.parse(transportistaData);
    setTransportista(t);
    
    try {
      const todosLosViajes = await apiClient.getViajes({ 
        transportista_id: t.id
      });

      const enProgreso = todosLosViajes.filter(v => v.estado === "en_progreso");
      const entregados = todosLosViajes.filter(v => v.estado === "entregado");
      const completados = todosLosViajes.filter(v => v.estado === "finalizado" || v.estado === "completado");
      
      setViajesEnProgreso(enProgreso);
      setViajesEntregados(entregados);
      setViajesCompletados(completados);
      
    } catch (error) {
      console.error("Error cargando viajes:", error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoEntregado = async (viajeId) => {
    if (!confirm("¿Confirmas que has llegado al destino y entregado la mercancía?")) {
      return;
    }

    setProcesandoEntrega(viajeId);
    try {
      await apiClient.updateEstadoViaje(viajeId, "entregado");
      await cargarDatos();
    } catch (error) {
      console.error("Error marcando viaje como entregado:", error);
      alert("Error al marcar el viaje como entregado");
    } finally {
      setProcesandoEntrega(null);
    }
  };

  const toggleGeolocalizacion = () => {
    if (geolocalizacionActiva) {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setGeolocalizacionActiva(false);
    } else {
      if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización");
        return;
      }

      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            await apiClient.updateUbicacionTransportista(
              transportista.id,
              latitude,
              longitude
            );
          } catch (error) {
            console.error("Error enviando ubicación:", error);
          }
        },
        (error) => {
          console.error("Error de geolocalización:", error);
          alert("Error obteniendo ubicación. Verifica los permisos del navegador.");
          setGeolocalizacionActiva(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      setWatchId(id);
      setGeolocalizacionActiva(true);
    }
  };

  const handleLogout = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
    localStorage.removeItem("transportista");
    router.push("/");
  };

  if (loading || !transportista) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Cargando viajes...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-accent" />
            <h1 className="font-semibold text-lg">Mis Viajes</h1>
          </div>
          <div className="flex items-center gap-2">
            {viajesEnProgreso.length > 0 && (
              <Button
                variant={geolocalizacionActiva ? "default" : "outline"}
                size="sm"
                onClick={toggleGeolocalizacion}
                className={geolocalizacionActiva ? "animate-pulse" : ""}
              >
                <Navigation className={`h-4 w-4 ${geolocalizacionActiva ? 'mr-2' : ''}`} />
                {geolocalizacionActiva && <span className="hidden sm:inline">GPS Activo</span>}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {viajesEnProgreso.length > 0 && (
          <Card className={`p-4 ${geolocalizacionActiva ? 'bg-success/5 border-success' : 'bg-muted'}`}>
            <div className="flex items-center gap-3">
              <Navigation className={`h-5 w-5 ${geolocalizacionActiva ? 'text-success' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {geolocalizacionActiva 
                    ? "Ubicación en tiempo real activa" 
                    : "Activar ubicación en tiempo real"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {geolocalizacionActiva
                    ? "Tu ubicación se está compartiendo con los proveedores"
                    : "Activa el GPS para que los proveedores vean tu ubicación exacta"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* {viajesEnProgreso.length > 0 && (
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Mapa de Viajes Activos</h2>
            <MapaViajes viajes={viajesEnProgreso} />
          </Card>
        )} */}

        <Tabs defaultValue="en-progreso" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en-progreso">
              En Progreso ({viajesEnProgreso.length})
            </TabsTrigger>
            <TabsTrigger value="entregados">
              Entregados ({viajesEntregados.length})
            </TabsTrigger>
            <TabsTrigger value="completados">
              Completados ({viajesCompletados.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="en-progreso" className="space-y-4 mt-4">
            {viajesEnProgreso.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tienes viajes en progreso</p>
                <Button 
                  className="mt-4"
                  onClick={() => router.push('/transportista/ofertas')}
                >
                  Ver Ofertas Disponibles
                </Button>
              </Card>
            ) : (
              viajesEnProgreso.map((viaje) => (
                <Card key={viaje.id} className="p-4 border-2 border-blue-200 dark:border-blue-800">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-blue-600">En Progreso</Badge>
                      <Badge variant="outline">Viaje #{viaje.id}</Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium">Origen:</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{viaje.origen}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium">Destino:</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{viaje.destino}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Distancia</p>
                        <p className="text-lg font-semibold">{viaje.distancia_total_km} km</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Progreso</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {viaje.distancia_total_km > 0 
                            ? ((viaje.distancia_recorrida_km / viaje.distancia_total_km) * 100).toFixed(0)
                            : 0}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Tiempo</p>
                        <p className="text-lg font-semibold">{viaje.tiempo_estimado_minutos} min</p>
                      </div>
                    </div>

                    {viaje.detenido_minutos > 30 && (
                      <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Viaje detenido por {viaje.detenido_minutos} minutos
                        </p>
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      onClick={() => marcarComoEntregado(viaje.id)}
                      disabled={procesandoEntrega === viaje.id}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {procesandoEntrega === viaje.id ? "Procesando..." : "Marcar como Entregado"}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="entregados" className="space-y-4 mt-4">
            {viajesEntregados.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tienes viajes entregados pendientes de confirmación</p>
              </Card>
            ) : (
              viajesEntregados.map((viaje) => (
                <Card key={viaje.id} className="p-4 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-yellow-600">Esperando Confirmación</Badge>
                      <Badge variant="outline">Viaje #{viaje.id}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {viaje.origen} → {viaje.destino}
                      </span>
                    </div>

                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⏳ Esperando que el proveedor confirme la entrega
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Distancia</p>
                        <p className="font-semibold">{viaje.distancia_total_km} km</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Tiempo Total</p>
                        <p className="font-semibold">{viaje.tiempo_transcurrido_minutos} min</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completados" className="space-y-4 mt-4">
            {viajesCompletados.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Aún no has completado ningún viaje</p>
              </Card>
            ) : (
              viajesCompletados.map((viaje) => (
                <Card key={viaje.id} className="p-4 border-2 border-success/30 bg-success/5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-success">Completado</Badge>
                      <Badge variant="outline">Viaje #{viaje.id}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {viaje.origen} → {viaje.destino}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Distancia</p>
                        <p className="font-semibold">{viaje.distancia_total_km} km</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Tiempo Total</p>
                        <p className="font-semibold">{viaje.tiempo_transcurrido_minutos} min</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Fecha</p>
                        <p className="font-semibold text-xs">
                          {viaje.fecha_fin ? new Date(viaje.fecha_fin).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav tipo="transportista" />
    </div>
  );
}
