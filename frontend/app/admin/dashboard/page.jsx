"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Package, Leaf, DollarSign, Star, Activity, UserCheck, UserX, BarChart3, Shield, Trash2, Edit, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [estadisticas, setEstadisticas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [actividad, setActividad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroUsuarios, setFiltroUsuarios] = useState("todos");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [stats, users, activity] = await Promise.all([
        apiClient.getEstadisticasAdmin(),
        apiClient.getUsuariosAdmin(),
        apiClient.getActividadReciente()
      ]);
      
      setEstadisticas(stats);
      setUsuarios(users);
      setActividad(activity);
    } catch (error) {
      console.error("[v0] Error cargando datos admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoUsuario = async (usuarioId, nuevoEstado) => {
    try {
      await apiClient.updateUsuarioAdmin(usuarioId, { estado: nuevoEstado });
      await cargarDatos();
    } catch (error) {
      console.error("[v0] Error actualizando usuario:", error);
    }
  };

  const eliminarUsuario = async (usuarioId) => {
    if (confirm("¿Seguro que deseas dar de baja este usuario?")) {
      try {
        await apiClient.eliminarUsuarioAdmin(usuarioId);
        await cargarDatos();
      } catch (error) {
        console.error("[v0] Error eliminando usuario:", error);
      }
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    if (filtroUsuarios === "todos") return true;
    return u.rol_global === filtroUsuarios;
  });

  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-balance">Panel de Administración</h1>
                <p className="text-muted-foreground">Control total del sistema logístico</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Usuarios
                </CardTitle>
                <Users className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estadisticas?.total_usuarios || 0}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {estadisticas?.total_proveedores || 0} proveedores, {estadisticas?.total_transportistas || 0} transportistas
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ingresos Totales
                </CardTitle>
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                €{(estadisticas?.ingresos_totales || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {estadisticas?.ordenes_completadas || 0} órdenes completadas
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  CO₂ Ahorrado
                </CardTitle>
                <Leaf className="w-5 h-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(estadisticas?.co2_total_ahorrado || 0).toFixed(0)} kg
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Impacto ambiental positivo
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reputación Promedio
                </CardTitle>
                <Star className="w-5 h-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(estadisticas?.reputacion_promedio || 0).toFixed(1)} / 5.0
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {estadisticas?.viajes_completados || 0} viajes completados
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas Avanzadas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Estado de Órdenes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completadas</span>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    {estadisticas?.ordenes_completadas || 0}
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all"
                    style={{
                      width: `${(estadisticas?.ordenes_completadas / (estadisticas?.total_ordenes || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">En Progreso</span>
                  <Badge variant="outline" className="bg-warning/10 text-warning">
                    {estadisticas?.ordenes_en_progreso || 0}
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full transition-all"
                    style={{
                      width: `${(estadisticas?.ordenes_en_progreso / (estadisticas?.total_ordenes || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{estadisticas?.total_ordenes || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Impacto Ambiental
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">CO₂ Emitido</span>
                  <span className="font-bold text-destructive">
                    {(estadisticas?.co2_total_emitido || 0).toFixed(0)} kg
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-destructive h-2 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">CO₂ Ahorrado</span>
                  <span className="font-bold text-success">
                    {(estadisticas?.co2_total_ahorrado || 0).toFixed(0)} kg
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all"
                    style={{
                      width: `${(estadisticas?.co2_total_ahorrado / (estadisticas?.co2_total_emitido || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Reducción</span>
                  <span className="font-bold text-success">
                    {((estadisticas?.co2_total_ahorrado / (estadisticas?.co2_total_emitido || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {actividad.slice(0, 5).map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{act.descripcion}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(act.fecha).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestión de Usuarios */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestión de Usuarios
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filtroUsuarios === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroUsuarios("todos")}
                >
                  Todos
                </Button>
                <Button
                  variant={filtroUsuarios === "proveedor" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroUsuarios("proveedor")}
                >
                  Proveedores
                </Button>
                <Button
                  variant={filtroUsuarios === "transportista" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroUsuarios("transportista")}
                >
                  Transportistas
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">Rol</th>
                    <th className="text-left p-3 font-semibold">Estado</th>
                    <th className="text-left p-3 font-semibold">Fecha Registro</th>
                    <th className="text-right p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="border-b hover:bg-secondary/50 transition-colors">
                      <td className="p-3 font-medium">{usuario.email}</td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {usuario.rol_global}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={usuario.estado === "activo" ? "default" : "destructive"}
                          className={usuario.estado === "activo" ? "bg-success" : ""}
                        >
                          {usuario.estado}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(usuario.creado_en).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          {usuario.estado === "activo" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cambiarEstadoUsuario(usuario.id, "inactivo")}
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cambiarEstadoUsuario(usuario.id, "activo")}
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => eliminarUsuario(usuario.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
