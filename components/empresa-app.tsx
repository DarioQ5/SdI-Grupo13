"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Building2,
  Package,
  MapPin,
  Calendar,
  Bell,
  User,
  LogOut,
  TrendingUp,
  Clock,
  Plus,
  Home,
  DollarSign,
  BarChart3,
  Users,
  TrendingDown,
  Activity,
  X,
  MapPinned,
} from "lucide-react"
import { MapaRuta } from "./mapa-ruta"
import { MapaArgentina } from "./mapa-argentina"

const empresa = {
  nombre: "LogiCorp Internacional",
  email: "contacto@logicorp.com",
  telefono: "+54 11 4567-8900",
  cargasPublicadas: 24,
  cargasActivas: 8,
}

const misCargasPublicadas = [
  {
    id: 1,
    origen: "Buenos Aires, Argentina",
    destino: "Santiago, Chile",
    carga: "Maquinaria pesada",
    peso: "25 toneladas",
    pago: "$7,200 USD",
    fechaCarga: "22 Nov 2024",
    estado: "Publicada",
    ofertas: 5,
  },
  {
    id: 2,
    origen: "Mendoza, Argentina",
    destino: "Valparaíso, Chile",
    carga: "Productos químicos",
    peso: "18 toneladas",
    pago: "$4,800 USD",
    fechaCarga: "25 Nov 2024",
    estado: "Publicada",
    ofertas: 3,
  },
]

const cargasEnTransito = [
  {
    id: 1,
    origen: "Córdoba, Argentina",
    destino: "Antofagasta, Chile",
    carga: "Repuestos automotrices",
    peso: "15 toneladas",
    transportista: "Juan Carlos Pérez",
    progreso: 45,
    fechaEntrega: "18 Nov 2024",
  },
  {
    id: 2,
    origen: "Rosario, Argentina",
    destino: "Lima, Perú",
    carga: "Textiles",
    peso: "12 toneladas",
    transportista: "María González",
    progreso: 78,
    fechaEntrega: "16 Nov 2024",
  },
]

const historialCargas = [
  {
    id: 1,
    ruta: "Buenos Aires → Valparaíso",
    fecha: "05 Nov 2024",
    costo: "$5,400 USD",
    transportista: "Carlos Rodríguez",
    calificacion: 5,
  },
  {
    id: 2,
    ruta: "Mendoza → Santos",
    fecha: "28 Oct 2024",
    costo: "$8,900 USD",
    transportista: "Ana Martínez",
    calificacion: 5,
  },
]

const estadisticasEmpresa = {
  totalGastado: 156800,
  ahorroLogistico: 23400,
  cargasCompletadas: 142,
  transportistasActivos: 28,
  eficienciaPromedio: 87.5,
  tiempoPromedioEntrega: 3.2,
  co2Reducido: 18.6,
  satisfaccionCliente: 4.7,
}

const datosGrafico = [
  { mes: "Jun", gastos: 12400, cargas: 18 },
  { mes: "Jul", gastos: 15200, cargas: 22 },
  { mes: "Ago", gastos: 18900, cargas: 26 },
  { mes: "Sep", gastos: 16500, cargas: 24 },
  { mes: "Oct", gastos: 21300, cargas: 29 },
  { mes: "Nov", gastos: 24800, cargas: 32 },
]

const ofertasRecibidas = [
  {
    id: 1,
    cargaId: 1,
    transportista: "Juan Carlos Pérez",
    calificacion: 4.8,
    viajes: 127,
    oferta: "$6,900 USD",
    tiempoEstimado: "2 días",
    camion: "Mercedes-Benz Actros",
  },
  {
    id: 2,
    cargaId: 1,
    transportista: "María González",
    calificacion: 4.9,
    viajes: 156,
    oferta: "$7,200 USD",
    tiempoEstimado: "1.5 días",
    camion: "Scania R450",
  },
  {
    id: 3,
    cargaId: 1,
    transportista: "Carlos Rodríguez",
    calificacion: 4.7,
    viajes: 98,
    oferta: "$6,800 USD",
    tiempoEstimado: "2.5 días",
    camion: "Volvo FH16",
  },
]

const transportistasDisponibles = [
  {
    id: 1,
    nombre: "Juan Carlos Pérez",
    calificacion: 4.8,
    viajes: 127,
    ubicacionActual: { lat: 140, lng: 100, nombre: "En ruta a Valparaíso" },
    destino: { lat: 125, lng: 40, nombre: "Valparaíso" },
    camion: "Mercedes-Benz Actros",
    capacidad: "24 ton",
    disponible: true,
    distanciaACarga: 120, // km desde origen de carga
    compatibilidad: "alta",
  },
  {
    id: 2,
    nombre: "María González",
    calificacion: 4.9,
    viajes: 156,
    ubicacionActual: { lat: 190, lng: 140, nombre: "Córdoba" },
    destino: { lat: 140, lng: 190, nombre: "Buenos Aires" },
    camion: "Scania R450",
    capacidad: "28 ton",
    disponible: true,
    distanciaACarga: 380,
    compatibilidad: "media",
  },
  {
    id: 3,
    nombre: "Carlos Rodríguez",
    calificacion: 4.7,
    viajes: 98,
    ubicacionActual: { lat: 25, lng: 100, nombre: "Lima, Perú" },
    destino: { lat: 100, lng: 100, nombre: "Santiago" },
    camion: "Volvo FH16",
    capacidad: "26 ton",
    disponible: true,
    distanciaACarga: 920,
    compatibilidad: "baja",
  },
]

export function EmpresaApp() {
  const [activeTab, setActiveTab] = useState("inicio")
  const [notificaciones] = useState(5)
  const [showNewCargaForm, setShowNewCargaForm] = useState(false)
  const [showOfertasModal, setShowOfertasModal] = useState(false)
  const [showTransportistasModal, setShowTransportistasModal] = useState(false)
  const [selectedCarga, setSelectedCarga] = useState<any>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [formData, setFormData] = useState({
    origen: "",
    destino: "",
    descripcion: "",
    peso: "",
    fecha: "",
    pago: "",
  })

  const handlePublicarCarga = () => {
    if (formData.origen && formData.destino && formData.descripcion && formData.peso && formData.pago) {
      alert(
        `¡Carga publicada exitosamente!\n\nOrigen: ${formData.origen}\nDestino: ${formData.destino}\nPeso: ${formData.peso} ton\nPago: $${formData.pago} USD`,
      )
      setFormData({ origen: "", destino: "", descripcion: "", peso: "", fecha: "", pago: "" })
      setShowNewCargaForm(false)
    } else {
      alert("Por favor completa todos los campos requeridos")
    }
  }

  const handleAceptarOferta = (oferta: any) => {
    alert(
      `¡Oferta aceptada!\n\nTransportista: ${oferta.transportista}\nPrecio: ${oferta.oferta}\nTiempo estimado: ${oferta.tiempoEstimado}`,
    )
    setShowOfertasModal(false)
  }

  const getCompatibilidadColor = (compatibilidad: string) => {
    switch (compatibilidad) {
      case "alta":
        return "bg-green-500 text-white"
      case "media":
        return "bg-orange-500 text-white"
      case "baja":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getCompatibilidadTexto = (compatibilidad: string) => {
    switch (compatibilidad) {
      case "alta":
        return "Muy cerca"
      case "media":
        return "Distancia media"
      case "baja":
        return "Muy lejos"
      default:
        return "Desconocido"
    }
  }

  const notificacionesData = [
    { id: 1, tipo: "oferta", mensaje: "3 nuevas ofertas para tu carga a Santiago", tiempo: "Hace 10 min" },
    { id: 2, tipo: "actualizacion", mensaje: "Carga en tránsito: 78% completado", tiempo: "Hace 1 hora" },
    { id: 3, tipo: "entrega", mensaje: "Carga entregada en Antofagasta", tiempo: "Hace 3 horas" },
    { id: 4, tipo: "pago", mensaje: "Factura #1234 procesada", tiempo: "Hace 5 horas" },
    { id: 5, tipo: "mensaje", mensaje: "Nuevo mensaje de transportista", tiempo: "Hace 6 horas" },
  ]

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b bg-card sticky top-0 z-50 hidden md:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CargoConnect</h1>
                <p className="text-xs text-muted-foreground">Portal Empresas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {notificaciones > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificaciones}
                  </span>
                )}
              </Button>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>LC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{empresa.nombre}</p>
                  <p className="text-xs text-muted-foreground">{empresa.cargasActivas} cargas activas</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm("¿Deseas cerrar sesión?")) {
                    window.location.reload()
                  }
                }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <header className="border-b bg-card sticky top-0 z-50 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold">CargoConnect</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-5 w-5" />
                {notificaciones > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notificaciones}
                  </span>
                )}
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">LC</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notificaciones</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="divide-y">
            {notificacionesData.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-muted cursor-pointer">
                <p className="text-sm font-medium">{notif.mensaje}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.tiempo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden md:grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="inicio" className="gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="mis-cargas" className="gap-2">
              <Package className="h-4 w-4" />
              Mis Cargas
            </TabsTrigger>
            <TabsTrigger value="en-transito" className="gap-2">
              <Clock className="h-4 w-4" />
              En Tránsito
            </TabsTrigger>
            <TabsTrigger value="estadisticas" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="perfil" className="gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inicio" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Dashboard Ejecutivo</h2>
              <Button onClick={() => setShowNewCargaForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Carga
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col gap-2">
                    <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Gastado</p>
                      <p className="text-xl md:text-2xl font-bold">
                        ${(estadisticasEmpresa.totalGastado / 1000).toFixed(1)}K
                      </p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Este año
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col gap-2">
                    <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ahorro</p>
                      <p className="text-xl md:text-2xl font-bold text-green-600">
                        ${(estadisticasEmpresa.ahorroLogistico / 1000).toFixed(1)}K
                      </p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        +15% vs año anterior
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col gap-2">
                    <Package className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cargas</p>
                      <p className="text-xl md:text-2xl font-bold">{estadisticasEmpresa.cargasCompletadas}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Completadas
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col gap-2">
                    <Activity className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Eficiencia</p>
                      <p className="text-xl md:text-2xl font-bold">{estadisticasEmpresa.eficienciaPromedio}%</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Excelente
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Gastos y Cargas</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {datosGrafico.map((dato, index) => {
                    const maxGasto = Math.max(...datosGrafico.map((d) => d.gastos))
                    const porcentaje = (dato.gastos / maxGasto) * 100
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium w-12">{dato.mes}</span>
                          <span className="text-muted-foreground flex-1 ml-4">{dato.cargas} cargas</span>
                          <span className="font-bold text-primary">${(dato.gastos / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Red de Transportistas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Activos</span>
                      <span className="text-2xl font-bold">{estadisticasEmpresa.transportistasActivos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Calificación promedio</span>
                      <span className="text-lg font-bold">⭐ {estadisticasEmpresa.satisfaccionCliente}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" />
                    Tiempo de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Promedio</span>
                      <span className="text-2xl font-bold">{estadisticasEmpresa.tiempoPromedioEntrega} días</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      12% más rápido que el mercado
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    Impacto Ambiental
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">CO₂ Reducido</span>
                      <span className="text-2xl font-bold text-green-600">{estadisticasEmpresa.co2Reducido} ton</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Equivalente a 420 árboles
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Cargas Publicadas Recientes</h3>
              <div className="grid gap-3">
                {misCargasPublicadas.slice(0, 2).map((carga) => (
                  <Card key={carga.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1 flex-1">
                          <p className="font-medium text-sm">{carga.carga}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {carga.origen} → {carga.destino}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {carga.ofertas} ofertas
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">{carga.pago}</span>
                        <Button size="sm" variant="outline">
                          Ver Ofertas
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">En Tránsito</h3>
              <div className="grid gap-3">
                {cargasEnTransito.slice(0, 1).map((carga) => (
                  <Card key={carga.id}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{carga.carga}</p>
                          <p className="text-xs text-muted-foreground">{carga.transportista}</p>
                        </div>
                        <Badge className="bg-accent text-accent-foreground">En tránsito</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-medium">{carga.progreso}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${carga.progreso}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transportistas Disponibles en Tiempo Real</CardTitle>
                    <CardDescription>Ubicación y compatibilidad con tus cargas</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowTransportistasModal(true)}>
                    Ver Mapa Completo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {transportistasDisponibles.slice(0, 2).map((transportista) => (
                    <Card key={transportista.id} className="relative">
                      <div className="absolute top-2 right-2">
                        <Badge className={getCompatibilidadColor(transportista.compatibilidad)}>
                          {getCompatibilidadTexto(transportista.compatibilidad)}
                        </Badge>
                      </div>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>{transportista.nombre.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-sm">{transportista.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              ⭐ {transportista.calificacion} • {transportista.viajes} viajes
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {transportista.ubicacionActual.nombre}
                            </p>
                            <p className="text-xs font-medium">📍 A {transportista.distanciaACarga} km de tu carga</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Camión</p>
                            <p className="font-medium">{transportista.camion}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Capacidad</p>
                            <p className="font-medium">{transportista.capacidad}</p>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-3">
                          Enviar Oferta
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mis-cargas" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold">Mis Cargas Publicadas</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTransportistasModal(true)}>
                  <MapPinned className="h-4 w-4 mr-2" />
                  Ver Transportistas
                </Button>
                <Button onClick={() => setShowNewCargaForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva
                </Button>
              </div>
            </div>

            {showNewCargaForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Publicar Nueva Carga</CardTitle>
                  <CardDescription>Completa los detalles de tu carga</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="origen">Origen *</Label>
                      <Input
                        id="origen"
                        placeholder="Ciudad, País"
                        value={formData.origen}
                        onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destino">Destino *</Label>
                      <Input
                        id="destino"
                        placeholder="Ciudad, País"
                        value={formData.destino}
                        onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción de la Carga *</Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Describe el tipo de carga..."
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="peso">Peso (toneladas) *</Label>
                      <Input
                        id="peso"
                        type="number"
                        placeholder="20"
                        value={formData.peso}
                        onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha">Fecha de Carga</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pago">Pago (USD) *</Label>
                      <Input
                        id="pago"
                        type="number"
                        placeholder="5000"
                        value={formData.pago}
                        onChange={(e) => setFormData({ ...formData, pago: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handlePublicarCarga}>
                      Publicar Carga
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewCargaForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {misCargasPublicadas.map((carga) => (
                <Card key={carga.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-base md:text-lg">{carga.carga}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {carga.origen} → {carga.destino}
                        </CardDescription>
                      </div>
                      <Badge className="bg-secondary text-secondary-foreground">{carga.pago}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Peso</p>
                        <p className="text-sm font-medium">{carga.peso}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha</p>
                        <p className="text-sm font-medium">{carga.fechaCarga}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Estado</p>
                        <Badge variant="outline" className="text-xs">
                          {carga.estado}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ofertas</p>
                        <p className="text-sm font-medium">{carga.ofertas} recibidas</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => {
                          setSelectedCarga(carga)
                          setShowOfertasModal(true)
                        }}
                      >
                        Ver Ofertas ({carga.ofertas})
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => alert("Función de editar en desarrollo")}>
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="en-transito" className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Cargas en Tránsito</h2>
            <div className="grid gap-4">
              {cargasEnTransito.map((carga) => (
                <Card key={carga.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-base md:text-lg">{carga.carga}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {carga.origen} → {carga.destino}
                        </CardDescription>
                      </div>
                      <Badge className="bg-accent text-accent-foreground">En tránsito</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MapaRuta
                      origen={carga.origen}
                      destino={carga.destino}
                      progreso={carga.progreso}
                      patente={`Transportista: ${carga.transportista}`}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Transportista</p>
                        <p className="text-sm font-medium">{carga.transportista}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Entrega Estimada</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {carga.fechaEntrega}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso del viaje</span>
                        <span className="font-medium">{carga.progreso}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${carga.progreso}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        size="sm"
                        onClick={() => alert("Abriendo vista de mapa completo...")}
                      >
                        Ver en Mapa
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        size="sm"
                        onClick={() => alert(`Contactando a ${carga.transportista}...`)}
                      >
                        Contactar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="estadisticas" className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Sistema de Información Gerencial (MIS)</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Costos</CardTitle>
                  <CardDescription>Desglose detallado de gastos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Transporte</span>
                      <span className="font-bold">$124,600</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "79%" }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Comisiones</span>
                      <span className="font-bold">$18,400</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: "12%" }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Seguros</span>
                      <span className="font-bold">$13,800</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: "9%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento por Ruta</CardTitle>
                  <CardDescription>Top 5 rutas más utilizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { ruta: "Buenos Aires → Santiago", cargas: 42, costo: "$45,200" },
                      { ruta: "Mendoza → Valparaíso", cargas: 38, costo: "$38,900" },
                      { ruta: "Córdoba → Antofagasta", cargas: 24, costo: "$28,400" },
                      { ruta: "Rosario → Lima", cargas: 18, costo: "$22,100" },
                      { ruta: "Santos → Santiago", cargas: 12, costo: "$18,200" },
                    ].map((ruta, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{ruta.ruta}</p>
                          <p className="text-xs text-muted-foreground">{ruta.cargas} cargas</p>
                        </div>
                        <span className="text-sm font-bold">{ruta.costo}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Perfil de Empresa</h2>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20">
                    <AvatarFallback className="text-xl md:text-2xl">LC</AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left flex-1">
                    <CardTitle className="text-lg md:text-xl">{empresa.nombre}</CardTitle>
                    <CardDescription>Empresa de Logística</CardDescription>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                      <Badge>{empresa.cargasPublicadas} cargas publicadas</Badge>
                      <Badge variant="secondary">{empresa.cargasActivas} activas</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium break-all">{empresa.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-sm font-medium">{empresa.telefono}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Historial Reciente</h3>
                  <div className="space-y-2">
                    {historialCargas.map((carga) => (
                      <div key={carga.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{carga.ruta}</p>
                          <p className="text-xs text-muted-foreground">{carga.transportista}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{carga.costo}</p>
                          <div className="flex">
                            {Array.from({ length: carga.calificacion }).map((_, i) => (
                              <span key={i} className="text-xs">
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full">Editar Perfil</Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t md:hidden z-50">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab("inicio")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "inicio" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Inicio</span>
          </button>
          <button
            onClick={() => setActiveTab("mis-cargas")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "mis-cargas" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">Cargas</span>
          </button>
          <button
            onClick={() => setActiveTab("en-transito")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "en-transito" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs">Tránsito</span>
          </button>
          <button
            onClick={() => setActiveTab("perfil")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "perfil" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </nav>

      <Dialog open={showOfertasModal} onOpenChange={setShowOfertasModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ofertas Recibidas</DialogTitle>
            <DialogDescription>Selecciona el mejor transportista para tu carga</DialogDescription>
          </DialogHeader>
          {selectedCarga && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedCarga.carga}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedCarga.origen} → {selectedCarga.destino}
                </p>
                <p className="text-sm mt-1">
                  Peso: <span className="font-medium">{selectedCarga.peso}</span>
                </p>
              </div>

              <div className="space-y-3">
                {ofertasRecibidas.map((oferta) => (
                  <Card key={oferta.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{oferta.transportista.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{oferta.transportista}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>⭐ {oferta.calificacion}</span>
                              <span>•</span>
                              <span>{oferta.viajes} viajes</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{oferta.oferta}</p>
                          <p className="text-xs text-muted-foreground">{oferta.tiempoEstimado}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Camión</p>
                          <p className="text-sm font-medium">{oferta.camion}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAceptarOferta(oferta)}>
                          Aceptar Oferta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showTransportistasModal} onOpenChange={setShowTransportistasModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transportistas Disponibles - Vista de Mapa</DialogTitle>
            <DialogDescription>
              Ubicación en tiempo real y compatibilidad con tus cargas. Sistema de matching inteligente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <MapaArgentina
              transportistas={transportistasDisponibles.map((t) => ({
                id: t.id,
                nombre: t.nombre,
                lat: t.ubicacionActual.lat,
                lng: t.ubicacionActual.lng,
                destino: t.destino,
                disponible: t.disponible,
              }))}
              cargas={misCargasPublicadas.map((c) => ({
                id: c.id,
                origen: { lat: 140, lng: 190, nombre: c.origen },
                destino: { lat: 100, lng: 100, nombre: c.destino },
              }))}
            />

            <div className="space-y-3">
              <h3 className="font-semibold">Transportistas Disponibles</h3>
              {transportistasDisponibles.map((transportista) => (
                <Card key={transportista.id} className="relative">
                  <div className="absolute top-3 right-3">
                    <Badge className={getCompatibilidadColor(transportista.compatibilidad)}>
                      {getCompatibilidadTexto(transportista.compatibilidad)} • {transportista.distanciaACarga} km
                    </Badge>
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{transportista.nombre.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="font-semibold">{transportista.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            ⭐ {transportista.calificacion} • {transportista.viajes} viajes completados
                          </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Ubicación Actual</p>
                            <p className="font-medium">{transportista.ubicacionActual.nombre}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Destino</p>
                            <p className="font-medium">{transportista.destino.nombre}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Camión</p>
                            <p className="font-medium">{transportista.camion}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Capacidad</p>
                            <p className="font-medium">{transportista.capacidad}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              alert(`Oferta enviada a ${transportista.nombre}`)
                              setShowTransportistasModal(false)
                            }}
                          >
                            Enviar Oferta
                          </Button>
                          <Button variant="outline" size="sm">
                            Ver Perfil
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Sistema de Matching Inteligente</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Calculamos automáticamente la compatibilidad basándonos en:
              </p>
              <ul className="text-sm space-y-1">
                <li>
                  🟢 <strong>Verde (Alta):</strong> Transportista a menos de 200 km del origen de tu carga
                </li>
                <li>
                  🟠 <strong>Naranja (Media):</strong> Transportista entre 200-500 km del origen
                </li>
                <li>
                  🔴 <strong>Rojo (Baja):</strong> Transportista a más de 500 km del origen
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
