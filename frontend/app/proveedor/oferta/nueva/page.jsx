"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, MapPin } from 'lucide-react';
import { apiClient } from "@/lib/api";
import { obtenerRutaReal } from "@/lib/routing";
import { Suspense } from "react";

const MapaSelectorUbicacion = dynamic(
  () => import("@/components/mapa-selector-ubicacion"),
  { ssr: false }
);

function NuevaOfertaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transportistaId = searchParams.get("transportista");
  
  const [proveedor, setProveedor] = useState(null);
  const [transportistas, setTransportistas] = useState([]);
  const [transportistaSeleccionado, setTransportistaSeleccionado] = useState("none");
  
  const [ubicacionOrigen, setUbicacionOrigen] = useState(null);
  const [ubicacionDestino, setUbicacionDestino] = useState(null);
  const [nombreOrigen, setNombreOrigen] = useState("");
  const [nombreDestino, setNombreDestino] = useState("");
  
  const [distancia, setDistancia] = useState(0);
  const [calculandoRuta, setCalculandoRuta] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [peso, setPeso] = useState("");
  const [volumen, setVolumen] = useState("");
  const [requiereFrio, setRequiereFrio] = useState("no");
  const [precio, setPrecio] = useState("");
  const [fechaRecogida, setFechaRecogida] = useState("");
  const [co2Estimado, setCo2Estimado] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrandoMapaOrigen, setMostrandoMapaOrigen] = useState(false);
  const [mostrandoMapaDestino, setMostrandoMapaDestino] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      const proveedorData = localStorage.getItem("proveedor");
      if (!proveedorData) {
        router.push("/proveedor/login");
        return;
      }
      
      const prov = JSON.parse(proveedorData);
      setProveedor(prov);

      try {
        const data = await apiClient.getTransportistas();
        setTransportistas(data);
        
        if (transportistaId) {
          setTransportistaSeleccionado(transportistaId);
        }
      } catch (error) {
        console.error("[v0] Error cargando transportistas:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [router, transportistaId]);

  useEffect(() => {
    const calcularDistancia = async () => {
      if (!ubicacionOrigen || !ubicacionDestino) {
        setDistancia(0);
        return;
      }

      setCalculandoRuta(true);
      try {
        const ruta = await obtenerRutaReal(
          ubicacionOrigen.lat,
          ubicacionOrigen.lng,
          ubicacionDestino.lat,
          ubicacionDestino.lng
        );
        
        setDistancia(Math.round(ruta.distance));
        console.log("[v0] Calculated distance:", ruta.distance, "km");
      } catch (error) {
        console.error("[v0] Error calculating distance:", error);
      } finally {
        setCalculandoRuta(false);
      }
    };

    calcularDistancia();
  }, [ubicacionOrigen, ubicacionDestino]);

  useEffect(() => {
    if (distancia && transportistaSeleccionado && transportistaSeleccionado !== "none") {
      const transportista = transportistas.find(t => t.id.toString() === transportistaSeleccionado);
      if (transportista && transportista.camion) {
        const factoresEmision = {
          "Diesel": 2.68,
          "GNC": 2.2,
          "Eléctrico": 0.5,
          "Gasolina": 2.3
        };
        
        const consumoPorKm = 0.35;
        const factor = factoresEmision[transportista.camion.combustible] || 2.68;
        const co2 = parseFloat(distancia) * consumoPorKm * factor;
        setCo2Estimado(co2);
      }
    }
  }, [distancia, transportistaSeleccionado, transportistas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ubicacionOrigen || !ubicacionDestino) {
      alert("Por favor selecciona origen y destino en el mapa");
      return;
    }
    
    setEnviando(true);
    
    try {
      const ordenData = {
        proveedor_id: proveedor.id,
        transportista_id: transportistaSeleccionado && transportistaSeleccionado !== "none" ? parseInt(transportistaSeleccionado) : null,
        tipo_carga: descripcion,
        peso_kg: parseFloat(peso),
        volumen_m3: volumen ? parseFloat(volumen) : null,
        origen: nombreOrigen || `Ubicación (${ubicacionOrigen.lat.toFixed(4)}, ${ubicacionOrigen.lng.toFixed(4)})`,
        destino: nombreDestino || `Ubicación (${ubicacionDestino.lat.toFixed(4)}, ${ubicacionDestino.lng.toFixed(4)})`,
        origen_lat: ubicacionOrigen.lat,
        origen_lon: ubicacionOrigen.lng,
        destino_lat: ubicacionDestino.lat,
        destino_lon: ubicacionDestino.lng,
        ventana_desde: fechaRecogida ? new Date(fechaRecogida).toISOString() : null,
        ventana_hasta: fechaRecogida ? new Date(new Date(fechaRecogida).getTime() + 24*60*60*1000).toISOString() : null,
        req_reefer: requiereFrio === "si",
        req_adr: false,
        precio: parseFloat(precio),
        distancia_km: parseFloat(distancia),
        co2_estimado: co2Estimado
      };

      await apiClient.crearOrden(ordenData);
      
      alert("Oferta enviada con éxito!");
      router.push("/proveedor/mapa");
    } catch (error) {
      console.error("[v0] Error enviando oferta:", error);
      alert("Error al enviar oferta: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  if (loading || !proveedor) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/proveedor/mapa">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Mapa
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Nueva Oferta de Carga</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="transportista">Transportista (opcional)</Label>
              <Select value={transportistaSeleccionado} onValueChange={setTransportistaSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un transportista o deja vacío" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno (oferta pública)</SelectItem>
                  {transportistas.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.nombre} - {t.camion?.tipo_camion || "Camión"} ({t.camion?.capacidad_kg || 0}kg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ubicación de Origen</Label>
                {ubicacionOrigen ? (
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <Input
                            placeholder="Nombre del origen (opcional)"
                            value={nombreOrigen}
                            onChange={(e) => setNombreOrigen(e.target.value)}
                            className="mb-2"
                          />
                          <p className="text-sm font-medium text-primary truncate">
                            Lat: {ubicacionOrigen.lat.toFixed(6)}, Lng: {ubicacionOrigen.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMostrandoMapaOrigen(true)}
                      >
                        Cambiar
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setMostrandoMapaOrigen(true)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Seleccionar Origen en Mapa
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Ubicación de Destino</Label>
                {ubicacionDestino ? (
                  <Card className="p-4 bg-destructive/5 border-destructive/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <MapPin className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <Input
                            placeholder="Nombre del destino (opcional)"
                            value={nombreDestino}
                            onChange={(e) => setNombreDestino(e.target.value)}
                            className="mb-2"
                          />
                          <p className="text-sm font-medium text-destructive truncate">
                            Lat: {ubicacionDestino.lat.toFixed(6)}, Lng: {ubicacionDestino.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMostrandoMapaDestino(true)}
                      >
                        Cambiar
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setMostrandoMapaDestino(true)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Seleccionar Destino en Mapa
                  </Button>
                )}
              </div>
            </div>

            {distancia > 0 && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-primary">
                      Distancia calculada por carretera: {distancia} km
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ruta real calculada usando OpenStreetMap
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {calculandoRuta && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Calculando ruta real por carretera...
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción de la Carga</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="ej: Productos congelados"
                required
                disabled={enviando}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="ej: 7500"
                  required
                  disabled={enviando}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volumen">Volumen (m³) - opcional</Label>
                <Input
                  id="volumen"
                  type="number"
                  step="0.1"
                  value={volumen}
                  onChange={(e) => setVolumen(e.target.value)}
                  placeholder="ej: 40"
                  disabled={enviando}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requiereFrio">Requiere Frío</Label>
                <Select value={requiereFrio} onValueChange={setRequiereFrio} disabled={enviando}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="si">Sí</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio (€)</Label>
                <Input
                  id="precio"
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="ej: 850"
                  required
                  disabled={enviando}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaRecogida">Fecha de Recogida</Label>
              <Input
                id="fechaRecogida"
                type="date"
                value={fechaRecogida}
                onChange={(e) => setFechaRecogida(e.target.value)}
                required
                disabled={enviando}
              />
            </div>

            {co2Estimado > 0 && (
              <Card className="p-4 bg-success/5 border-success/20">
                <p className="text-sm font-medium text-success">
                  🌱 CO₂ Estimado: {co2Estimado.toFixed(2)} kg
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Basado en distancia real y tipo de combustible del transportista
                </p>
              </Card>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={enviando || distancia === 0 || !ubicacionOrigen || !ubicacionDestino}>
              <Send className="mr-2 h-4 w-4" />
              {enviando ? "Enviando..." : "Enviar Oferta"}
            </Button>
          </form>
        </Card>
      </div>

      {mostrandoMapaOrigen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Seleccionar Origen en el Mapa</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMostrandoMapaOrigen(false)}
              >
                Cerrar
              </Button>
            </div>
            <div className="p-4">
              <MapaSelectorUbicacion
                onUbicacionSeleccionada={(ubicacion) => {
                  setUbicacionOrigen(ubicacion);
                  setMostrandoMapaOrigen(false);
                }}
                ubicacionInicial={ubicacionOrigen}
                tipo="origen"
              />
            </div>
          </Card>
        </div>
      )}

      {mostrandoMapaDestino && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Seleccionar Destino en el Mapa</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMostrandoMapaDestino(false)}
              >
                Cerrar
              </Button>
            </div>
            <div className="p-4">
              <MapaSelectorUbicacion
                onUbicacionSeleccionada={(ubicacion) => {
                  setUbicacionDestino(ubicacion);
                  setMostrandoMapaDestino(false);
                }}
                ubicacionInicial={ubicacionDestino}
                tipo="destino"
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function NuevaOferta() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <NuevaOfertaContent />
    </Suspense>
  );
}
