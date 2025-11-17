"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";

export default function NotificacionesPanel({ proveedorId, usuarioId }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    const cargarNotificaciones = async () => {
      if (!usuarioId) {
        cargarNotificacionesLocal();
        return;
      }

      try {
        const data = await apiClient.getNotificaciones(usuarioId);
        
        const notificacionesTransformadas = data.map(n => ({
          id: n.id,
          tipo: extraerTipoDeEvento(n.evento),
          mensaje: n.evento,
          timestamp: n.ts_envio,
          leida: n.leida,
          urgente: n.evento.includes("detenido") && n.evento.includes("60")
        }));
        
        setNotificaciones(notificacionesTransformadas);
        setNoLeidas(notificacionesTransformadas.filter(n => !n.leida).length);
      } catch (error) {
        console.error("[v0] Error cargando notificaciones:", error);
        cargarNotificacionesLocal();
      }
    };

    const cargarNotificacionesLocal = () => {
      const viajes = JSON.parse(localStorage.getItem("viajes") || "[]");
      const viajesProveedor = viajes.filter(v => v.proveedorId === proveedorId && v.estado === "en_curso");
      
      const todasNotificaciones = [];

      viajesProveedor.forEach(viaje => {
        if (viaje.detenido && viaje.tiempoDetenido >= 30) {
          todasNotificaciones.push({
            id: `${viaje.id}-detenido`,
            viajeId: viaje.id,
            tipo: "detenido",
            mensaje: `El camión de ${viaje.origen.nombre} a ${viaje.destino.nombre} está detenido hace ${viaje.tiempoDetenido} minutos`,
            timestamp: new Date().toISOString(),
            leida: false,
            urgente: viaje.tiempoDetenido >= 60
          });
        }

        if (viaje.progreso >= 45 && viaje.progreso <= 55) {
          todasNotificaciones.push({
            id: `${viaje.id}-mitad`,
            viajeId: viaje.id,
            tipo: "mitad_camino",
            mensaje: `El camión de ${viaje.origen.nombre} a ${viaje.destino.nombre} está a mitad del trayecto`,
            timestamp: new Date().toISOString(),
            leida: false,
            urgente: false
          });
        }

        if (viaje.progreso >= 85 && viaje.progreso < 100) {
          todasNotificaciones.push({
            id: `${viaje.id}-proximo`,
            viajeId: viaje.id,
            tipo: "proximo_llegar",
            mensaje: `El camión está por llegar a ${viaje.destino.nombre} (${Math.round(viaje.etaMinutos)} min)`,
            timestamp: new Date().toISOString(),
            leida: false,
            urgente: false
          });
        }
      });

      todasNotificaciones.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotificaciones(todasNotificaciones);
      setNoLeidas(todasNotificaciones.filter(n => !n.leida).length);
    };

    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30000);

    return () => clearInterval(interval);
  }, [proveedorId, usuarioId]);

  const extraerTipoDeEvento = (evento) => {
    if (evento.includes("detenido")) return "detenido";
    if (evento.includes("mitad")) return "mitad_camino";
    if (evento.includes("llegar")) return "proximo_llegar";
    if (evento.includes("aceptada")) return "oferta_aceptada";
    return "general";
  };

  const marcarComoLeida = async (notifId) => {
    if (usuarioId && typeof notifId === "number") {
      try {
        await apiClient.marcarNotificacionLeida(notifId);
      } catch (error) {
        console.error("[v0] Error marcando notificación:", error);
      }
    }
    
    setNotificaciones(prev => 
      prev.map(n => n.id === notifId ? { ...n, leida: true } : n)
    );
    setNoLeidas(prev => Math.max(0, prev - 1));
  };

  const getIcono = (tipo) => {
    switch (tipo) {
      case "detenido":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "mitad_camino":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "proximo_llegar":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "oferta_aceptada":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {noLeidas > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500"
          >
            {noLeidas}
          </Badge>
        )}
      </Button>

      {mostrarPanel && (
        <Card className="notificaciones-panel absolute right-0 top-12 w-80 sm:w-96 max-h-[500px] overflow-y-auto shadow-lg" style={{ zIndex: 9999 }}>
          <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
            <h3 className="font-semibold">Notificaciones</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMostrarPanel(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="divide-y divide-border">
            {notificaciones.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No hay notificaciones
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notif.leida ? "bg-muted/30" : ""
                  }`}
                  onClick={() => marcarComoLeida(notif.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcono(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">
                        {notif.mensaje}
                        {notif.urgente && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Urgente
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notif.timestamp).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notif.leida && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
