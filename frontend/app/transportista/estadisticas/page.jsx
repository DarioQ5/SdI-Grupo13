"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, TrendingUp, Award, Leaf, Package, DollarSign, Clock, MapPin } from 'lucide-react';
import { apiClient } from "@/lib/api";
import { MobileNav } from "@/components/mobile-nav";

export default function TransportistaEstadisticas() {
  const router = useRouter();
  const [transportista, setTransportista] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const stats = await apiClient.request(`/api/transportistas/${t.id}/estadisticas`);
      setEstadisticas(stats);
    } catch (error) {
      console.error("[v0] Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
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
        <p className="mt-4 text-muted-foreground">Cargando estadísticas...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-accent" />
            <h1 className="font-semibold text-lg">Mis Estadísticas</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Viajes Totales</p>
                <p className="text-2xl font-bold">{estadisticas?.viajes_completados || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">Reputación</p>
                <p className="text-2xl font-bold">⭐ {estadisticas?.reputacion || 5.0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
            <div className="flex items-center gap-3">
              <Leaf className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">CO₂ Total</p>
                <p className="text-2xl font-bold">{estadisticas?.emisiones_co2_total?.toFixed(0) || 0} kg</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-bold">{estadisticas?.ingresos_totales?.toFixed(0) || 0}€</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de Rendimiento</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Viajes Completados</span>
                <span className="font-semibold">{estadisticas?.viajes_completados || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Viajes en Progreso</span>
                <span className="font-semibold">{estadisticas?.viajes_en_progreso || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ofertas Aceptadas</span>
                <span className="font-semibold">{estadisticas?.ofertas_aceptadas || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasa de Aceptación</span>
                <span className="font-semibold">{estadisticas?.tasa_aceptacion || 0}%</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Distancia Total</span>
                <span className="font-semibold">{estadisticas?.distancia_total_km?.toFixed(0) || 0} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CO₂ Promedio/Viaje</span>
                <span className="font-semibold">{estadisticas?.co2_promedio_viaje?.toFixed(1) || 0} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Calificaciones Recibidas</span>
                <span className="font-semibold">{estadisticas?.cantidad_calificaciones || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ingreso Promedio/Viaje</span>
                <span className="font-semibold">{estadisticas?.ingreso_promedio_viaje?.toFixed(0) || 0}€</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Impacto Ambiental</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Emisiones CO₂ Totales</p>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500"
                    style={{ 
                      width: `${Math.min((estadisticas?.emisiones_co2_total || 0) / 1000 * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-semibold">
                {estadisticas?.emisiones_co2_total?.toFixed(0) || 0} kg
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">CO₂ Ahorrado (Optimización)</p>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ 
                      width: `${Math.min((estadisticas?.co2_ahorrado || 0) / 1000 * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600">
                {estadisticas?.co2_ahorrado?.toFixed(0) || 0} kg
              </span>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Has recorrido <span className="font-semibold text-foreground">{estadisticas?.distancia_total_km?.toFixed(0) || 0} km</span> en total,
                con un promedio de <span className="font-semibold text-foreground">{estadisticas?.co2_promedio_viaje?.toFixed(1) || 0} kg de CO₂</span> por viaje.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <MobileNav tipo="transportista" />
    </div>
  );
}
