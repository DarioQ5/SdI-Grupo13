"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from 'lucide-react';
import { apiClient } from "@/lib/api";

export default function ProveedorRegistro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    razon_social: "",
    cuit: "",
    telefono: ""
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
        razon_social: formData.razon_social,
        cuit: formData.cuit,
        telefono: formData.telefono
      };

      const response = await apiClient.registroProveedor(registroData);
      
      const proveedorData = {
        id: response.perfil.id,
        usuarioId: response.usuario.id,
        nombre: response.perfil.razon_social || `Proveedor ${response.perfil.id}`,
        email: response.usuario.email,
        razon_social: response.perfil.razon_social,
        cuit: response.perfil.cuit,
        telefono: response.perfil.telefono
      };
      
      localStorage.setItem("proveedor", JSON.stringify(proveedorData));
      router.push("/proveedor/mapa");
    } catch (err) {
      console.error("[v0] Error en registro:", err);
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 my-8">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">Registro de Proveedor</h1>
          <p className="text-muted-foreground text-center mt-2">Completa tus datos para comenzar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="razon_social">Razón Social</Label>
            <Input
              id="razon_social"
              placeholder="Empresa S.A."
              value={formData.razon_social}
              onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuit">CUIT</Label>
            <Input
              id="cuit"
              placeholder="30-12345678-9"
              value={formData.cuit}
              onChange={(e) => setFormData({...formData, cuit: e.target.value})}
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
          <Link href="/proveedor/login">
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
