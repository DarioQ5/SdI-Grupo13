"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Truck, MapPin, Package, DollarSign, Calendar, Weight, Snowflake, AlertTriangle } from 'lucide-react';
import { apiClient } from "@/lib/api";
import { MobileNav } from "@/components/mobile-nav";

export default function TransportistaOfertas() {
  const router = useRouter();
  const [transportista, setTransportista] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [ofertasAceptadas, setOfertasAceptadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const transportistaData = localStorage.getItem("transportista");
    if (!transportistaData) {
      router.push("/transportista/login");
      return;
    }

    const t = JSON.parse(transportistaData);
    setTransportista(t);
    
    try {
      // Cargar ofertas disponibles
      const ordenesData = await apiClient.getOrdenes({ 
        estado: "publicada" 
      });
      setOfertas(ordenesData);

      // Cargar ofertas aceptadas
      const aceptadas = await apiClient.getOrdenes({ 
        estado: "aceptada",
        transportista_id: t.id
      });
      setOfertasAceptadas(aceptadas);
      setLimiteAlcanzado(aceptadas.length >= 2);
      
    } catch (error) {
      console.error("[v0] Error cargando ofertas:", error);
    } finally {
      setLoading(false);
    }
  };

  const aceptarOferta = async (ordenId) => {
    if (limiteAlcanzado) {
      alert("Has alcanzado el límite de 2 ofertas aceptadas. Completa o cancela una oferta antes de aceptar otra.");
      return;
    }

    try {
      await apiClient.updateEstadoOrden(ordenId, "aceptada", transportista.id);
      alert("Oferta aceptada! Ya puedes ver el viaje en tu sección de Viajes");
      await cargarDatos();
    } catch (error) {
      console.error("[v0] Error aceptando oferta:", error);
      alert(error.message || "Error al aceptar oferta. Puede que ya tengas 2 ofertas aceptadas.");
    }
  };

  const rechazarOferta = async (ordenId) => {
    try {
      await apiClient.updateEstadoOrden(ordenId, "rechazada");
      alert("Oferta rechazada");
      await cargarDatos();
    } catch (error) {
      console.error("[v0] Error rechazando oferta:", error);
      alert("Error al rechazar oferta");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("transportista");
    router.push("/");
  };

  if (loading || !transportista) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Cargando ofertas...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-accent" />
            <h1 className="font-semibold text-lg">Mis Ofertas</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {limiteAlcanzado && (
          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">Límite alcanzado</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Has alcanzado el límite de 2 ofertas aceptadas simultáneamente. 
                  Completa o cancela una oferta para poder aceptar nuevas.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Tabs defaultValue="disponibles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="disponibles">
              Disponibles ({ofertas.length})
            </TabsTrigger>
            <TabsTrigger value="aceptadas">
              Aceptadas ({ofertasAceptadas.length}/2)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="disponibles" className="space-y-4 mt-4">
            {ofertas.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No hay ofertas disponibles en este momento</p>
              </Card>
            ) : (
              ofertas.map((oferta) => (
                <Card key={oferta.id} className="p-4 border-2 hover:border-primary/50 transition-colors">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {oferta.origen} → {oferta.destino}
                          </span>
                          <Badge variant="secondary">{oferta.distancia_km} km</Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span>{oferta.tipo_carga} - {oferta.peso_kg} kg</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {oferta.req_reefer && (
                            <Badge variant="outline" className="text-blue-600">
                              <Snowflake className="h-3 w-3 mr-1" />
                              Refrigerado
                            </Badge>
                          )}
                          {oferta.req_adr && (
                            <Badge variant="outline" className="text-red-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              ADR
                            </Badge>
                          )}
                          {oferta.ventana_desde && (
                            <Badge variant="outline">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(oferta.ventana_desde).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-2xl font-bold text-success">
                          <DollarSign className="h-5 w-5" />
                          {oferta.precio}
                        </div>
                        <p className="text-xs text-muted-foreground">EUR</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-success hover:bg-success/90"
                        onClick={() => aceptarOferta(oferta.id)}
                        disabled={limiteAlcanzado}
                      >
                        Aceptar Oferta
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => rechazarOferta(oferta.id)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="aceptadas" className="space-y-4 mt-4">
            {ofertasAceptadas.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tienes ofertas aceptadas</p>
              </Card>
            ) : (
              ofertasAceptadas.map((oferta) => (
                <Card key={oferta.id} className="p-4 border-2 border-success/30 bg-success/5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-success">Aceptada</Badge>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xl font-bold text-success">
                          <DollarSign className="h-4 w-4" />
                          {oferta.precio}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {oferta.origen} → {oferta.destino}
                      </span>
                      <Badge variant="secondary">{oferta.distancia_km} km</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{oferta.tipo_carga} - {oferta.peso_kg} kg</span>
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/transportista/viajes')}
                    >
                      Ver en Viajes
                    </Button>
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
