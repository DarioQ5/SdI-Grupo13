"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck } from 'lucide-react';
import { apiClient } from "@/lib/api";

export default function TransportistaLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await apiClient.login(email, password);
      
      if (response.tipo === "admin") {
        localStorage.setItem("admin", JSON.stringify(response.perfil));
        router.push("/admin/dashboard");
        return;
      }
      
      if (response.tipo === "transportista") {
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
        return;
      }
      
      setError("Este usuario no es un transportista. Por favor usa el login de proveedor.");
    } catch (err) {
      console.error("[v0] Error en login:", err);
      setError("Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
            <Truck className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-center">Transportista</h1>
          <p className="text-muted-foreground text-center mt-2">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            ¿No tienes cuenta?
          </p>
          <Link href="/transportista/registro">
            <Button variant="outline" className="w-full">
              Registrarse
            </Button>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </Card>
    </div>
  );
}
