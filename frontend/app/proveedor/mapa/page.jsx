"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Plus, Package, Truck, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificacionesPanel from "@/components/notificaciones-panel";
import LeafletLoader from "@/app/leaflet-loader";
import { apiClient } from "@/lib/api";
import { ModalConfirmacionEntrega } from "@/components/modal-confirmacion-entrega";

const MapaTransportistas = dynamic(
  () => import("@/components/mapa-transportistas"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    )
  }
);

const MapaViajesContratados = dynamic(
  () => import("@/components/mapa-viajes-contratados"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    )
  }
);

export default function ProveedorMapa() {
  const router = useRouter();
  const [proveedor, setProveedor] = useState(null);
  const [transportistas, setTransportistas] = useState([]);
  const [viajesContratados, setViajesContratados] = useState([]);
  const [viajesEntregados, setViajesEntregados] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroFriorifico, setFiltroFrigorifico] = useState("todos");
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState("todos");
  const [transportistaSeleccionado, setTransportistaSeleccionado] = useState(null);
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("disponibles");
  const [loading, setLoading] = useState(true);
  const [tiposCamion, setTiposCamion] = useState([]);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [viajeParaConfirmar, setViajeParaConfirmar] = useState(null);
  const [ordenParaConfirmar, setOrdenParaConfirmar] = useState(null);

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
        const tipos = await apiClient.getTiposCamion();
        setTiposCamion(tipos.map(t => t.nombre));
        
        await cargarTransportistas();
        
        const todosLosViajes = await apiClient.getViajes({ 
          proveedor_id: prov.id
        });

        const enProgreso = todosLosViajes.filter(v => v.estado === "en_progreso");
        const entregados = todosLosViajes.filter(v => v.estado === "entregado");
        
        const viajesTransformados = enProgreso.map((v) => {
          const distanciaTotal = v.ruta_completa && v.distancia_total_km 
            ? v.distancia_total_km 
            : 0;
          
          const progreso = distanciaTotal > 0 
            ? Math.round((v.distancia_recorrida_km / distanciaTotal) * 100)
            : 0;
          
          const etaMinutos = v.tiempo_estimado_minutos - v.tiempo_transcurrido_minutos;

          return {
            id: v.id,
            transportistaId: v.transportista_id,
            proveedorId: v.proveedor_id,
            ordenId: v.orden_id,
            origen: {
              nombre: v.origen,
              lat: v.origen_lat,
              lng: v.origen_lon
            },
            destino: {
              nombre: v.destino,
              lat: v.destino_lat,
              lng: v.destino_lon
            },
            ubicacionActual: {
              lat: v.ubicacion_actual_lat,
              lng: v.ubicacion_actual_lon
            },
            distancia: distanciaTotal,
            distanciaRecorrida: v.distancia_recorrida_km,
            progreso: progreso,
            tiempoTranscurrido: v.tiempo_transcurrido_minutos,
            tiempoEstimado: v.tiempo_estimado_minutos,
            etaMinutos: etaMinutos > 0 ? etaMinutos : 0,
            detenido: v.detenido_minutos > 30,
            tiempoDetenido: v.detenido_minutos,
            estado: v.estado,
            horaInicio: v.fecha_inicio,
            horaEstimadaLlegada: new Date(Date.now() + etaMinutos * 60000).toISOString(),
            co2Estimado: 0,
            rutaCompleta: v.ruta_completa || []
          };
        });

        const viajesEntregadosTransformados = entregados.map((v) => ({
          id: v.id,
          transportistaId: v.transportista_id,
          ordenId: v.orden_id,
          origen: v.origen,
          destino: v.destino,
          distancia_total_km: v.distancia_total_km,
          distancia_recorrida_km: v.distancia_recorrida_km,
          tiempo_estimado_minutos: v.tiempo_estimado_minutos,
          tiempo_transcurrido_minutos: v.tiempo_transcurrido_minutos,
          estado: v.estado,
          fecha_inicio: v.fecha_inicio,
          fecha_fin: v.fecha_fin
        }));
        
        setViajesContratados(viajesTransformados);
        setViajesEntregados(viajesEntregadosTransformados);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
    const intervalo = setInterval(cargarDatos, 15000);
    return () => clearInterval(intervalo);
  }, [router]);

  const cargarTransportistas = async () => {
    try {
      const filtros = {};
      
      if (filtroDisponibilidad === "disponible") {
        filtros.disponible = true;
      }
      
      if (filtroTipo !== "todos") {
        filtros.tipo_camion = filtroTipo;
      }
      
      if (filtroFriorifico !== "todos") {
        filtros.reefer = filtroFriorifico === "si";
      }
      
      const data = await apiClient.getTransportistas(filtros);
      
      const transportistasTransformados = data.map(t => ({
        id: t.id,
        nombre: t.nombre,
        email: t.email || "",
        tipoCamion: t.camion?.tipo_camion || "Camión",
        capacidad: t.camion?.capacidad_kg || 0,
        equipoFrigorifico: t.camion?.reefer || false,
        combustible: t.camion?.combustible || "Diesel",
        disponible: t.disponible,
        ubicacion: {
          lat: t.ubicacion_actual_lat || 40.4168,
          lng: t.ubicacion_actual_lon || -3.7038
        },
        tiempoDesocupacion: t.disponible ? 0 : Math.floor(Math.random() * 5),
        reputacion: t.reputacion,
        viajesCompletados: t.viajes_completados,
        emisionesCO2Total: t.emisiones_co2_total
      }));
      
      setTransportistas(transportistasTransformados);
    } catch (error) {
      console.error("[v0] Error cargando transportistas:", error);
      setTransportistas([]);
    }
  };

  useEffect(() => {
    if (proveedor) {
      cargarTransportistas();
    }
  }, [filtroTipo, filtroFriorifico, filtroDisponibilidad, proveedor]);

  const abrirConfirmacionEntrega = async (viaje) => {
    try {
      // Get the order details
      const ordenes = await apiClient.getOrdenes({ proveedor_id: proveedor.id });
      const orden = ordenes.find(o => o.id === viaje.ordenId);
      
      if (orden) {
        setViajeParaConfirmar(viaje);
        setOrdenParaConfirmar(orden);
        setMostrarModalConfirmacion(true);
      }
    } catch (error) {
      console.error("Error cargando orden:", error);
      alert("Error al cargar los detalles de la orden");
    }
  };

  const confirmarEntrega = async () => {
    try {
      await apiClient.updateEstadoViaje(viajeParaConfirmar.id, "finalizado");
      
      // Reload trips
      const todosLosViajes = await apiClient.getViajes({ 
        proveedor_id: proveedor.id
      });
      
      const enProgreso = todosLosViajes.filter(v => v.estado === "en_progreso");
      const entregados = todosLosViajes.filter(v => v.estado === "entregado");
      
      setViajesContratados(enProgreso.map(v => ({
        // Transform logic same as above
        id: v.id,
        transportistaId: v.transportista_id,
        proveedorId: v.proveedor_id,
        ordenId: v.orden_id,
        origen: { nombre: v.origen, lat: v.origen_lat, lng: v.origen_lon },
        destino: { nombre: v.destino, lat: v.destino_lat, lng: v.destino_lon },
        ubicacionActual: { lat: v.ubicacion_actual_lat, lng: v.ubicacion_actual_lon },
        distancia: v.distancia_total_km,
        distanciaRecorrida: v.distancia_recorrida_km,
        progreso: v.distancia_total_km > 0 ? Math.round((v.distancia_recorrida_km / v.distancia_total_km) * 100) : 0,
        tiempoTranscurrido: v.tiempo_transcurrido_minutos,
        tiempoEstimado: v.tiempo_estimado_minutos,
        etaMinutos: Math.max(0, v.tiempo_estimado_minutos - v.tiempo_transcurrido_minutos),
        detenido: v.detenido_minutos > 30,
        tiempoDetenido: v.detenido_minutos,
        estado: v.estado,
        horaInicio: v.fecha_inicio,
        horaEstimadaLlegada: new Date(Date.now() + Math.max(0, v.tiempo_estimado_minutos - v.tiempo_transcurrido_minutos) * 60000).toISOString(),
        co2Estimado: 0,
        rutaCompleta: v.ruta_completa || []
      })));

      setViajesEntregados(entregados.map(v => ({
        id: v.id,
        transportistaId: v.transportista_id,
        ordenId: v.orden_id,
        origen: v.origen,
        destino: v.destino,
        distancia_total_km: v.distancia_total_km,
        distancia_recorrida_km: v.distancia_recorrida_km,
        tiempo_estimado_minutos: v.tiempo_estimado_minutos,
        tiempo_transcurrido_minutos: v.tiempo_transcurrido_minutos,
        estado: v.estado,
        fecha_inicio: v.fecha_inicio,
        fecha_fin: v.fecha_fin
      })));
      
    } catch (error) {
      console.error("Error confirmando entrega:", error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("proveedor");
    router.push("/");
  };

  if (loading || !proveedor) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Cargando mapa...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <LeafletLoader />
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-semibold text-lg">{proveedor.nombre}</h1>
              <p className="text-xs text-muted-foreground">{proveedor.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificacionesPanel proveedorId={proveedor.id} usuarioId={proveedor.usuarioId} />
            
            <Link href="/proveedor/oferta/nueva">
              <Button size="sm" className="hidden sm:flex">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Oferta
              </Button>
              <Button size="sm" className="sm:hidden">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <Card className="p-4 h-fit">
            <Tabs value={vistaActiva} onValueChange={setVistaActiva} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="disponibles" className="text-xs sm:text-sm">
                  <Search className="h-4 w-4 mr-1" />
                  Buscar
                </TabsTrigger>
                <TabsTrigger value="contratados" className="text-xs sm:text-sm relative">
                  <Truck className="h-4 w-4 mr-1" />
                  Mis Viajes
                  {viajesEntregados.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-warning text-warning-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {viajesEntregados.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="disponibles" className="space-y-4 mt-0">
                <h2 className="font-semibold text-lg">Filtros</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Camión</Label>
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {tiposCamion.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Equipo Frigorífico</Label>
                    <Select value={filtroFriorifico} onValueChange={setFiltroFrigorifico}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Disponibilidad</Label>
                    <Select value={filtroDisponibilidad} onValueChange={setFiltroDisponibilidad}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="disponible">Disponible ahora</SelectItem>
                        <SelectItem value="pronto">Disponible pronto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#22c55e]"></div>
                        <span className="text-muted-foreground">Cerca y disponible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#eab308]"></div>
                        <span className="text-muted-foreground">Disponible (lejos)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#f97316]"></div>
                        <span className="text-muted-foreground">Ocupado (pronto)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
                        <span className="text-muted-foreground">No disponible</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground pt-2">
                    Mostrando {transportistas.length} transportista{transportistas.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contratados" className="space-y-4 mt-0">
                <h2 className="font-semibold text-lg">Viajes Activos</h2>
                
                {viajesEntregados.length > 0 && (
                  <div className="bg-warning/10 border-2 border-warning p-3 rounded-lg">
                    <p className="text-sm font-medium text-warning-foreground">
                      {viajesEntregados.length} entrega{viajesEntregados.length > 1 ? 's' : ''} pendiente{viajesEntregados.length > 1 ? 's' : ''} de confirmación
                    </p>
                  </div>
                )}

                {viajesEntregados.map((viaje) => (
                  <Card 
                    key={`entregado-${viaje.id}`}
                    className="p-3 cursor-pointer bg-yellow-50/50 dark:bg-yellow-950/20 border-2 border-yellow-300 dark:border-yellow-700"
                    onClick={() => abrirConfirmacionEntrega(viaje)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate text-yellow-900 dark:text-yellow-100">
                            {viaje.origen} → {viaje.destino}
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            Entregado - Requiere confirmación
                          </p>
                        </div>
                        <span className="text-xs text-yellow-600 font-medium whitespace-nowrap animate-pulse">
                          ⏳ Confirmar
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}

                <div className="space-y-2">
                  {viajesContratados.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No tienes viajes activos en este momento
                    </p>
                  ) : (
                    viajesContratados.map((viaje) => (
                      <Card 
                        key={viaje.id} 
                        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                          viajeSeleccionado?.id === viaje.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setViajeSeleccionado(viaje)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {viaje.origen.nombre} → {viaje.destino.nombre}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Progreso: {viaje.progreso}%
                              </p>
                            </div>
                            {viaje.detenido && (
                              <span className="text-xs text-red-500 font-medium whitespace-nowrap">
                                Detenido
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${viaje.progreso}%` }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                {viajesContratados.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#22c55e]"></div>
                        <span className="text-muted-foreground">Origen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
                        <span className="text-muted-foreground">Camión</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
                        <span className="text-muted-foreground">Destino</span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          <div className="space-y-4">
            <Card className="p-4 overflow-hidden" style={{ height: "600px" }}>
              {vistaActiva === "disponibles" ? (
                <MapaTransportistas
                  transportistas={transportistas}
                  onTransportistaClick={setTransportistaSeleccionado}
                />
              ) : (
                <MapaViajesContratados
                  viajes={viajesContratados}
                  onViajeClick={setViajeSeleccionado}
                />
              )}
            </Card>

            {vistaActiva === "disponibles" && transportistaSeleccionado && (
              <Card className="p-6">
                <h3 className="font-semibold text-xl mb-4">{transportistaSeleccionado.nombre}</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Camión</p>
                    <p className="font-medium">{transportistaSeleccionado.tipoCamion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidad</p>
                    <p className="font-medium">{transportistaSeleccionado.capacidad} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Combustible</p>
                    <p className="font-medium">{transportistaSeleccionado.combustible}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Frigorífico</p>
                    <p className="font-medium">{transportistaSeleccionado.equipoFrigorifico ? "Sí" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reputación</p>
                    <p className="font-medium">⭐ {transportistaSeleccionado.reputacion} ({transportistaSeleccionado.viajesCompletados} viajes)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CO₂ Total</p>
                    <p className="font-medium">{transportistaSeleccionado.emisionesCO2Total.toFixed(0)} kg</p>
                  </div>
                </div>
                <Link href={`/proveedor/oferta/nueva?transportista=${transportistaSeleccionado.id}`}>
                  <Button className="w-full">
                    Enviar Oferta
                  </Button>
                </Link>
              </Card>
            )}

            {vistaActiva === "contratados" && viajeSeleccionado && (
              <Card className="p-6">
                <h3 className="font-semibold text-xl mb-4">Detalles del Viaje</h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Origen</p>
                      <p className="font-medium">{viajeSeleccionado.origen.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Destino</p>
                      <p className="font-medium">{viajeSeleccionado.destino.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Distancia Total</p>
                      <p className="font-medium">{viajeSeleccionado.distancia} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Distancia Recorrida</p>
                      <p className="font-medium">{viajeSeleccionado.distanciaRecorrida.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Progreso</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${viajeSeleccionado.progreso}%` }}
                          />
                        </div>
                        <span className="font-medium">{viajeSeleccionado.progreso}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo Transcurrido</p>
                      <p className="font-medium">
                        {Math.floor(viajeSeleccionado.tiempoTranscurrido / 60)}h {viajeSeleccionado.tiempoTranscurrido % 60}min
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ETA</p>
                      <p className="font-medium">{Math.round(viajeSeleccionado.etaMinutos)} minutos</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <p className={`font-medium ${viajeSeleccionado.detenido ? 'text-red-500' : 'text-green-500'}`}>
                        {viajeSeleccionado.detenido ? `Detenido (${viajeSeleccionado.tiempoDetenido} min)` : 'En movimiento'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hora Estimada Llegada</p>
                      <p className="font-medium">
                        {new Date(viajeSeleccionado.horaEstimadaLlegada).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {mostrarModalConfirmacion && viajeParaConfirmar && ordenParaConfirmar && (
        <ModalConfirmacionEntrega
          viaje={viajeParaConfirmar}
          orden={ordenParaConfirmar}
          onConfirmar={confirmarEntrega}
          onCancelar={() => setMostrarModalConfirmacion(false)}
          onClose={() => {
            setMostrarModalConfirmacion(false);
            setViajeParaConfirmar(null);
            setOrdenParaConfirmar(null);
          }}
        />
      )}
    </div>
  );
}
