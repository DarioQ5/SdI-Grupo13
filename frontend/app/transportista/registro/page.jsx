"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Truck } from 'lucide-react';
import { apiClient } from "@/lib/api";

export default function TransportistaRegistro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    cuil_cuit: "",
    telefono: "",
    patente: "",
    tipo_camion: "Camión rígido",
    capacidad_kg: "",
    volumen_m3: "",
    reefer: false,
    adr: false,
    combustible: "diesel"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const registroData = {
        email: formData.email,
        password: formData.password,
        cuil_cuit: formData.cuil_cuit,
        telefono: formData.telefono,
        patente: formData.patente,
        tipo_camion: formData.tipo_camion,
        capacidad_kg: parseFloat(formData.capacidad_kg),
        volumen_m3: formData.volumen_m3 ? parseFloat(formData.volumen_m3) : null,
        reefer: formData.reefer,
        adr: formData.adr,
        combustible: formData.combustible
      };

      const response = await apiClient.registroTransportista(registroData);
      
      const transportistaData = {
        id: response.perfil.id,
        usuarioId: response.usuario.id,
        nombre: `Transportista ${response.perfil.id}`,
        email: response.usuario.email,
        cuil_cuit: response.perfil.cuil_cuit,
        telefono: response.perfil.telefono,
        disponible: response.perfil.disponible,
        ubicacion_actual_lat: response.perfil.ubicacion_actual_lat,
        ubicacion_actual_lon: response.perfil.ubicacion_actual_lon,
        viajes_completados: response.perfil.viajes_completados,
        reputacion: response.perfil.reputacion,
        emisiones_co2_total: response.perfil.emisiones_co2_total,
        camion: response.camion
      };
      
      localStorage.setItem("transportista", JSON.stringify(transportistaData));
      router.push("/transportista/perfil");
    } catch (err) {
      console.error("[v0] Error en registro:", err);
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 my-8">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
            <Truck className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-center">Registro de Transportista</h1>
          <p className="text-muted-foreground text-center mt-2">Completa tus datos para comenzar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Datos de acceso</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Datos personales</h3>
            <div className="space-y-2">
              <Label htmlFor="cuil_cuit">CUIL/CUIT</Label>
              <Input
                id="cuil_cuit"
                placeholder="20-12345678-9"
                value={formData.cuil_cuit}
                onChange={(e) => setFormData({...formData, cuil_cuit: e.target.value})}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Datos del vehículo</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patente">Patente</Label>
                <Input
                  id="patente"
                  placeholder="ABC-1234"
                  value={formData.patente}
                  onChange={(e) => setFormData({...formData, patente: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_camion">Tipo de camión</Label>
                <Select 
                  value={formData.tipo_camion} 
                  onValueChange={(value) => setFormData({...formData, tipo_camion: value})}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Camión rígido">Camión rígido</SelectItem>
                    <SelectItem value="Tráiler">Tráiler</SelectItem>
                    <SelectItem value="Mega camión">Mega camión</SelectItem>
                    <SelectItem value="Furgoneta">Furgoneta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidad_kg">Capacidad (kg)</Label>
                <Input
                  id="capacidad_kg"
                  type="number"
                  placeholder="24000"
                  value={formData.capacidad_kg}
                  onChange={(e) => setFormData({...formData, capacidad_kg: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volumen_m3">Volumen (m³)</Label>
                <Input
                  id="volumen_m3"
                  type="number"
                  placeholder="100"
                  value={formData.volumen_m3}
                  onChange={(e) => setFormData({...formData, volumen_m3: e.target.value})}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="combustible">Combustible</Label>
                <Select 
                  value={formData.combustible} 
                  onValueChange={(value) => setFormData({...formData, combustible: value})}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="gnc">GNC</SelectItem>
                    <SelectItem value="electrico">Eléctrico</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="reefer" 
                  checked={formData.reefer}
                  onCheckedChange={(checked) => setFormData({...formData, reefer: checked})}
                  disabled={loading}
                />
                <Label htmlFor="reefer" className="cursor-pointer">
                  Frigorífico (Reefer)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="adr" 
                  checked={formData.adr}
                  onCheckedChange={(checked) => setFormData({...formData, adr: checked})}
                  disabled={loading}
                />
                <Label htmlFor="adr" className="cursor-pointer">
                  ADR (Mercancías peligrosas)
                </Label>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            ¿Ya tienes cuenta?
          </p>
          <Link href="/transportista/login">
            <Button variant="outline" className="w-full">
              Iniciar sesión
            </Button>
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </Card>
    </div>
  );
}
