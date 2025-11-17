"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Package, Star } from 'lucide-react';
import { CalificacionModal } from "./calificacion-modal";

export function ModalConfirmacionEntrega({ viaje, orden, onConfirmar, onCancelar, onClose }) {
  const [mostrarCalificacion, setMostrarCalificacion] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const tiempoEstimado = viaje.tiempo_estimado_minutos;
  const tiempoReal = viaje.tiempo_transcurrido_minutos;
  const diferenciaTiempo = tiempoReal - tiempoEstimado;
  const puntual = diferenciaTiempo <= 0;
  const demora = Math.abs(diferenciaTiempo);

  const handleConfirmar = async () => {
    setConfirmando(true);
    try {
      await onConfirmar();
      setMostrarCalificacion(true);
    } catch (error) {
      console.error("Error confirmando entrega:", error);
      alert("Error al confirmar la entrega");
      setConfirmando(false);
    }
  };

  const handleSkipCalificacion = () => {
    setMostrarCalificacion(false);
    onClose();
  };

  if (mostrarCalificacion && orden) {
    return (
      <CalificacionModal
        orden={orden}
        viaje={viaje}
        estadisticasEntrega={{
          puntual: puntual,
          demora: demora,
          tiempoEstimado: tiempoEstimado,
          tiempoReal: tiempoReal
        }}
        onClose={handleSkipCalificacion}
        onSuccess={onClose}
        permitirSkip={true}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            Confirmar Entrega
          </CardTitle>
          <CardDescription>
            Viaje #{viaje.id} - {viaje.origen} → {viaje.destino}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
              El transportista ha marcado este viaje como entregado
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Por favor, verifica que has recibido la mercancía correctamente antes de confirmar
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Estadísticas de Entrega</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tiempo Estimado</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.floor(tiempoEstimado / 60)}h {tiempoEstimado % 60}m
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tiempo Real</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.floor(tiempoReal / 60)}h {tiempoReal % 60}m
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${puntual ? 'bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-800'}`}>
              <div className="flex items-center gap-3">
                {puntual ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        Entrega Puntual
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {diferenciaTiempo === 0 ? 'En tiempo exacto' : `${Math.abs(diferenciaTiempo)} minutos antes de lo estimado`}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="font-semibold text-orange-800 dark:text-orange-200">
                        Demora en Entrega
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {demora} minutos de retraso
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Detalles del Viaje</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Distancia:</span>
                  <span className="ml-2 font-medium">{viaje.distancia_total_km} km</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Recorrido:</span>
                  <span className="ml-2 font-medium">{viaje.distancia_recorrida_km.toFixed(1)} km</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Califica este servicio
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Después de confirmar podrás calificar al transportista (opcional)
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelar}
              disabled={confirmando}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmar}
              disabled={confirmando}
              className="bg-success hover:bg-success/90"
            >
              {confirmando ? "Confirmando..." : "Confirmar Entrega"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
