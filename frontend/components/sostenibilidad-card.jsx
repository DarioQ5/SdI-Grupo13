"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingDown, Award } from 'lucide-react';

export function SostenibilidadCard({ co2Emitido, co2Ahorrado, viajesCompletados }) {
  const reduccionPorcentaje = co2Emitido > 0 ? ((co2Ahorrado / co2Emitido) * 100).toFixed(1) : 0;
  const co2PorViaje = viajesCompletados > 0 ? (co2Emitido / viajesCompletados).toFixed(2) : 0;

  return (
    <Card className="border-l-4 border-l-success">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-success">
          <Leaf className="w-5 h-5" />
          Impacto Ambiental
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="w-4 h-4" />
              CO₂ Emitido
            </div>
            <div className="text-2xl font-bold text-destructive">
              {co2Emitido.toFixed(0)} kg
            </div>
            <div className="text-xs text-muted-foreground">
              {co2PorViaje} kg por viaje
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="w-4 h-4" />
              CO₂ Ahorrado
            </div>
            <div className="text-2xl font-bold text-success">
              {co2Ahorrado.toFixed(0)} kg
            </div>
            <div className="text-xs text-muted-foreground">
              Gracias a la optimización
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="w-4 h-4" />
              Reducción
            </div>
            <div className="text-2xl font-bold text-success">
              {reduccionPorcentaje}%
            </div>
            <div className="text-xs text-muted-foreground">
              Impacto positivo
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso de reducción</span>
            <span className="font-semibold">{reduccionPorcentaje}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className="bg-gradient-to-r from-success to-success/70 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(reduccionPorcentaje, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {co2Ahorrado > 1000 
              ? "¡Excelente! Estás haciendo una gran diferencia para el medio ambiente."
              : "Cada viaje optimizado ayuda a reducir las emisiones de CO₂."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
