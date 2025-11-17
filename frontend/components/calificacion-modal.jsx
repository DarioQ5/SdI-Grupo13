"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from "@/lib/api";

export function CalificacionModal({ orden, viaje, estadisticasEntrega, onClose, onSuccess, permitirSkip = false }) {
  const [puntuacion, setPuntuacion] = useState(5);
  const [puntualidad, setPuntualidad] = useState(estadisticasEntrega?.puntual ? 5 : 3);
  const [cuidadoCarga, setCuidadoCarga] = useState(5);
  const [comunicacion, setComunicacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.crearCalificacion({
        orden_id: orden.id,
        transportista_id: orden.transportista_asignado_id,
        proveedor_id: orden.proveedor_id,
        puntuacion,
        comentario,
        puntualidad,
        cuidado_carga: cuidadoCarga,
        comunicacion
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creando calificación:", error);
      alert("Error al enviar la calificación");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (confirm("¿Estás seguro que deseas omitir la calificación?")) {
      onClose();
    }
  };

  const RatingStars = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value
                  ? "fill-warning text-warning"
                  : "fill-none text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Calificar Servicio</CardTitle>
          <CardDescription>
            Orden #{orden.id} - {orden.origen} a {orden.destino}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {estadisticasEntrega && (
            <div className="mb-6 space-y-3">
              <h3 className="font-semibold">Resumen de Entrega</h3>
              <div className={`p-3 rounded-lg ${estadisticasEntrega.puntual ? 'bg-green-50 dark:bg-green-950/20' : 'bg-orange-50 dark:bg-orange-950/20'}`}>
                <div className="flex items-center gap-2">
                  {estadisticasEntrega.puntual ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Cumplió con el plazo esperado
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Demora de {estadisticasEntrega.demora} minutos
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Tiempo estimado: {Math.floor(estadisticasEntrega.tiempoEstimado / 60)}h {estadisticasEntrega.tiempoEstimado % 60}m | 
                  Tiempo real: {Math.floor(estadisticasEntrega.tiempoReal / 60)}h {estadisticasEntrega.tiempoReal % 60}m
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ✓ Producto entregado correctamente
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <RatingStars
              value={puntuacion}
              onChange={setPuntuacion}
              label="Calificación General"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RatingStars
                value={puntualidad}
                onChange={setPuntualidad}
                label="Puntualidad"
              />
              <RatingStars
                value={cuidadoCarga}
                onChange={setCuidadoCarga}
                label="Cuidado de Carga"
              />
              <RatingStars
                value={comunicacion}
                onChange={setComunicacion}
                label="Comunicación"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comentario">Comentario (opcional)</Label>
              <Textarea
                id="comentario"
                placeholder="Comparte tu experiencia con este transportista..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3 justify-end">
              {permitirSkip && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Omitir
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Calificación"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
