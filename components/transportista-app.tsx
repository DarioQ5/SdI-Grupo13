"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Bell,
  User,
  LogOut,
  CheckCircle2,
  TrendingUp,
  Navigation,
  Home,
  MessageSquare,
  FileText,
  BarChart3,
  Phone,
  Mail,
  X,
  MapPinned,
} from "lucide-react"
import { MapaRuta } from "./mapa-ruta"
import { MapaArgentina } from "./mapa-argentina"

// Datos hardcodeados
const transportista = {
  nombre: "Juan Carlos Pérez",
  email: "jcperez@transporte.com",
  telefono: "+54 9 11 2345-6789",
  calificacion: 4.8,
  viajesCompletados: 127,
  ubicacionActual: { lat: -32.95, lng: -70.2, nombre: "En ruta" },
}

const misCamiones = [
  {
    id: 1,
    patente: "AB 123 CD",
    modelo: "Mercedes-Benz Actros",
    capacidad: "24 toneladas",
    estado: "Disponible",
    ubicacion: "Mendoza, Argentina",
  },
  {
    id: 2,
    patente: "EF 456 GH",
    modelo: "Scania R450",
    capacidad: "28 toneladas",
    estado: "En viaje",
    ubicacion: "En ruta a Valparaíso",
  },
]

const cargasDisponibles = [
  {
    id: 1,
    origen: "Valparaíso, Chile",
    destino: "Mendoza, Argentina",
    distancia: "380 km",
    carga: "Productos electrónicos",
    peso: "18 toneladas",
    pago: "$2,400 USD",
    fechaCarga: "15 Nov 2024",
    empresa: "TechImport SA",
    coordenadasOrigen: { lat: -33.0472, lng: -71.6127 },
    coordenadasDestino: { lat: -32.8895, lng: -68.8458 },
    distanciaDesdeTransportista: 120, // km
    compatibilidad: "alta", // alta, media, baja
  },
  {
    id: 2,
    origen: "Santos, Brasil",
    destino: "Santiago, Chile",
    distancia: "3,200 km",
    carga: "Maquinaria industrial",
    peso: "22 toneladas",
    pago: "$8,500 USD",
    fechaCarga: "18 Nov 2024",
    empresa: "IndustrialCorp",
    coordenadasOrigen: { lat: -23.9608, lng: -46.3336 },
    coordenadasDestino: { lat: -33.4489, lng: -70.6693 },
    distanciaDesdeTransportista: 850,
    compatibilidad: "baja",
  },
  {
    id: 3,
    origen: "Buenos Aires, Argentina",
    destino: "Antofagasta, Chile",
    distancia: "1,850 km",
    carga: "Alimentos no perecederos",
    peso: "20 toneladas",
    pago: "$5,200 USD",
    fechaCarga: "20 Nov 2024",
    empresa: "FoodLogistics",
    coordenadasOrigen: { lat: -34.6037, lng: -58.3816 },
    coordenadasDestino: { lat: -23.6509, lng: -70.3975 },
    distanciaDesdeTransportista: 450,
    compatibilidad: "media",
  },
]

const misCargas = [
  {
    id: 1,
    origen: "Mendoza, Argentina",
    destino: "Valparaíso, Chile",
    estado: "En tránsito",
    progreso: 65,
    carga: "Vinos y productos agrícolas",
    fechaEntrega: "14 Nov 2024",
    pago: "$3,200 USD",
    coordenadasOrigen: { lat: -32.8895, lng: -68.8458 },
    coordenadasDestino: { lat: -33.0472, lng: -71.6127 },
    coordenadasActual: { lat: -32.95, lng: -70.2 },
  },
]

const historial = [
  {
    id: 1,
    ruta: "Buenos Aires → Santiago",
    fecha: "28 Oct 2024",
    pago: "$6,800 USD",
    calificacion: 5,
  },
  {
    id: 2,
    ruta: "Mendoza → Santos",
    fecha: "15 Oct 2024",
    pago: "$9,200 USD",
    calificacion: 5,
  },
  {
    id: 3,
    ruta: "Valparaíso → Córdoba",
    fecha: "02 Oct 2024",
    pago: "$4,100 USD",
    calificacion: 4,
  },
]

const facturacion = {
  mesActual: "$18,400 USD",
  pendiente: "$3,200 USD",
  pagado: "$15,200 USD",
  proximoPago: "20 Nov 2024",
}

const estadisticas = {
  kmRecorridos: 45230,
  kmSinCarga: 8940,
  porcentajeRetornoCargado: 80.2,
  co2Ahorrado: "12.4 toneladas",
  eficienciaPromedio: 92,
}

export function TransportistaApp() {
  const [activeTab, setActiveTab] = useState("inicio")
  const [notificaciones] = useState(3)
  const [selectedCarga, setSelectedCarga] = useState<any>(null)
  const [showCargaDetails, setShowCargaDetails] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLocationPermission, setShowLocationPermission] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [disponibleParaCargas, setDisponibleParaCargas] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [estadoActualizacion, setEstadoActualizacion] = useState("")
  const [cargasAceptadas, setCargasAceptadas] = useState<number[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!locationEnabled) {
        setShowLocationPermission(true)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [locationEnabled])

  const handleAceptarCarga = (cargaId: number) => {
    const carga = cargasDisponibles.find((c) => c.id === cargaId)
    if (carga && carga.compatibilidad === "baja") {
      if (
        !confirm(
          "Esta carga está muy lejos de tu ubicación actual. ¿Estás seguro de que quieres aceptarla? Esto podría afectar tu eficiencia.",
        )
      ) {
        return
      }
    }
    setCargasAceptadas([...cargasAceptadas, cargaId])
    setShowCargaDetails(false)
    alert("¡Carga aceptada exitosamente! Se ha notificado a la empresa.")
  }

  const handleEnviarMensaje = () => {
    if (mensaje.trim()) {
      alert(`Mensaje enviado: "${mensaje}"`)
      setMensaje("")
      setShowContactModal(false)
    }
  }

  const handleActualizarEstado = () => {
    if (estadoActualizacion) {
      alert(`Estado actualizado a: ${estadoActualizacion}`)
      setEstadoActualizacion("")
      setShowUpdateModal(false)
    }
  }

  const handleEnableLocation = () => {
    setLocationEnabled(true)
    setShowLocationPermission(false)
    alert("¡Ubicación activada! Ahora las empresas pueden ver tu posición y calcular la compatibilidad de cargas.")
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
    { id: 1, tipo: "nueva_carga", mensaje: "Nueva carga disponible: Valparaíso → Mendoza", tiempo: "Hace 5 min" },
    { id: 2, tipo: "pago", mensaje: "Pago recibido: $3,200 USD", tiempo: "Hace 2 horas" },
    { id: 3, tipo: "mensaje", mensaje: "Nuevo mensaje de TechImport SA", tiempo: "Hace 4 horas" },
  ]

  const cargasOrdenadas = [...cargasDisponibles].sort((a, b) => {
    const orden = { alta: 0, media: 1, baja: 2 }
    return orden[a.compatibilidad as keyof typeof orden] - orden[b.compatibilidad as keyof typeof orden]
  })

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b bg-card sticky top-0 z-50 hidden md:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CargoConnect</h1>
                <p className="text-xs text-muted-foreground">Portal Transportista</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                <MapPinned className={`h-4 w-4 ${locationEnabled ? "text-green-600" : "text-muted-foreground"}`} />
                <span className="text-xs">{locationEnabled ? "Ubicación activa" : "Ubicación desactivada"}</span>
              </div>
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
                  <AvatarFallback>JC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{transportista.nombre}</p>
                  <p className="text-xs text-muted-foreground">⭐ {transportista.calificacion}</p>
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
                <Truck className="h-5 w-5" />
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
                <AvatarFallback className="text-xs">JC</AvatarFallback>
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
          <TabsList className="hidden md:grid w-full grid-cols-7 h-auto">
            <TabsTrigger value="inicio" className="gap-2">
              <Home className="h-4 w-4" />
              Inicio
            </TabsTrigger>
            <TabsTrigger value="cargas-disponibles" className="gap-2">
              <Package className="h-4 w-4" />
              Cargas
            </TabsTrigger>
            <TabsTrigger value="mis-cargas" className="gap-2">
              <Navigation className="h-4 w-4" />
              Activas
            </TabsTrigger>
            <TabsTrigger value="mis-camiones" className="gap-2">
              <Truck className="h-4 w-4" />
              Flota
            </TabsTrigger>
            <TabsTrigger value="facturacion" className="gap-2">
              <FileText className="h-4 w-4" />
              Facturación
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
            <h2 className="text-2xl font-bold">Panel de Control</h2>

            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">Estado de Disponibilidad</h3>
                    <p className="text-sm text-muted-foreground">
                      {disponibleParaCargas
                        ? "Estás visible para nuevas cargas"
                        : "No estás recibiendo ofertas de carga"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={disponibleParaCargas}
                      onCheckedChange={setDisponibleParaCargas}
                      disabled={!locationEnabled}
                    />
                    <Badge variant={disponibleParaCargas ? "default" : "secondary"}>
                      {disponibleParaCargas ? "Disponible" : "No disponible"}
                    </Badge>
                  </div>
                </div>
                {!locationEnabled && (
                  <p className="text-xs text-destructive mt-2">Debes activar la ubicación para ponerte disponible</p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Viajes</p>
                      <p className="text-xl md:text-2xl font-bold">{transportista.viajesCompletados}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Package className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Activas</p>
                      <p className="text-xl md:text-2xl font-bold">1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Este Mes</p>
                      <p className="text-xl md:text-2xl font-bold">$18.4K</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl md:text-3xl">⭐</div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="text-xl md:text-2xl font-bold">{transportista.calificacion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Carga en Tránsito</CardTitle>
                <CardDescription>Seguimiento en tiempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {misCargas.map((carga) => (
                  <div key={carga.id} className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{carga.carga}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {carga.origen} → {carga.destino}
                        </p>
                      </div>
                      <Badge className="bg-accent text-accent-foreground">{carga.estado}</Badge>
                    </div>

                    <MapaRuta
                      origen={carga.origen}
                      destino={carga.destino}
                      progreso={carga.progreso}
                      patente={misCamiones[1].patente}
                    />

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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Entrega</p>
                        <p className="text-sm font-medium">{carga.fechaEntrega}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pago</p>
                        <p className="text-sm font-medium">{carga.pago}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setSelectedCarga(carga)
                          setShowContactModal(true)
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contactar
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedCarga(carga)
                          setShowUpdateModal(true)
                        }}
                      >
                        Actualizar Estado
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Cargas Disponibles (Ordenadas por proximidad)</h3>
                <Button variant="link" size="sm" onClick={() => setActiveTab("cargas-disponibles")}>
                  Ver todas
                </Button>
              </div>
              <div className="grid gap-3">
                {cargasOrdenadas.slice(0, 2).map((carga) => (
                  <Card key={carga.id} className="relative">
                    <div className="absolute top-2 right-2">
                      <Badge className={getCompatibilidadColor(carga.compatibilidad)}>
                        {getCompatibilidadTexto(carga.compatibilidad)}
                      </Badge>
                    </div>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1 flex-1 pr-20">
                          <p className="font-medium text-sm">{carga.carga}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {carga.origen} → {carga.destino}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            📍 A {carga.distanciaDesdeTransportista} km de tu ubicación
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs absolute bottom-4 right-4">
                          {carga.pago}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedCarga(carga)
                          setShowCargaDetails(true)
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cargas-disponibles" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold">Cargas Disponibles</h2>
              <Badge variant="secondary">{cargasDisponibles.length} disponibles</Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mapa de Cargas Disponibles</CardTitle>
                <CardDescription>Tu ubicación y cargas cercanas</CardDescription>
              </CardHeader>
              <CardContent>
                <MapaArgentina
                  transportistas={[
                    {
                      id: 1,
                      nombre: transportista.nombre,
                      lat: 140,
                      lng: 100,
                      destino: { lat: 125, lng: 40, nombre: "Valparaíso" },
                      disponible: disponibleParaCargas,
                    },
                  ]}
                  cargas={cargasDisponibles.map((c) => ({
                    id: c.id,
                    origen: { lat: 125, lng: 40, nombre: c.origen },
                    destino: { lat: 140, lng: 90, nombre: c.destino },
                  }))}
                />
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {cargasOrdenadas.map((carga) => (
                <Card key={carga.id} className="hover:shadow-lg transition-shadow relative">
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={getCompatibilidadColor(carga.compatibilidad)}>
                      {getCompatibilidadTexto(carga.compatibilidad)} • {carga.distanciaDesdeTransportista} km
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 pr-32">
                        <CardTitle className="text-base md:text-lg">{carga.carga}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">
                            {carga.origen} → {carga.destino}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className="bg-secondary text-secondary-foreground shrink-0 absolute bottom-3 right-3">
                        {carga.pago}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Distancia Total</p>
                        <p className="text-sm font-medium">{carga.distancia}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Peso</p>
                        <p className="text-sm font-medium">{carga.peso}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha de Carga</p>
                        <p className="text-sm font-medium">{carga.fechaCarga}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Empresa</p>
                        <p className="text-sm font-medium">{carga.empresa}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => handleAceptarCarga(carga.id)}
                        disabled={cargasAceptadas.includes(carga.id)}
                      >
                        {cargasAceptadas.includes(carga.id) ? "Aceptada ✓" : "Aceptar Carga"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCarga(carga)
                          setShowCargaDetails(true)
                        }}
                      >
                        Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mis-cargas" className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Mis Cargas Activas</h2>
            <div className="grid gap-4">
              {misCargas.map((carga) => (
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
                      <Badge className="bg-accent text-accent-foreground">{carga.estado}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MapaRuta
                      origen={carga.origen}
                      destino={carga.destino}
                      progreso={carga.progreso}
                      patente={misCamiones[1].patente}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha de Entrega</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {carga.fechaEntrega}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pago</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {carga.pago}
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
                        onClick={() => {
                          setSelectedCarga(carga)
                          setShowContactModal(true)
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contactar
                      </Button>
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => {
                          setSelectedCarga(carga)
                          setShowUpdateModal(true)
                        }}
                      >
                        Actualizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mis-camiones" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold">Mi Flota</h2>
              <Button size="sm">
                <Truck className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Agregar</span>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {misCamiones.map((camion) => (
                <Card key={camion.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-base md:text-lg">{camion.modelo}</CardTitle>
                        <CardDescription className="text-xs">Patente: {camion.patente}</CardDescription>
                      </div>
                      <Badge variant={camion.estado === "Disponible" ? "default" : "secondary"}>{camion.estado}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Capacidad</p>
                        <p className="text-sm font-medium">{camion.capacidad}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ubicación</p>
                        <p className="text-sm font-medium">{camion.ubicacion}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                        Detalles
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="facturacion" className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Gestión Económica</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumen del Mes</CardTitle>
                  <CardDescription>Noviembre 2024</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Facturado</span>
                      <span className="text-lg font-bold text-primary">{facturacion.mesActual}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pagado</span>
                      <span className="text-sm font-medium text-green-600">{facturacion.pagado}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pendiente</span>
                      <span className="text-sm font-medium text-amber-600">{facturacion.pendiente}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Próximo Pago</p>
                    <p className="text-sm font-medium">{facturacion.proximoPago}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Comisiones de Plataforma</CardTitle>
                  <CardDescription>Desglose de costos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Comisión (8%)</span>
                    <span className="text-sm font-medium">$1,472 USD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Servicios adicionales</span>
                    <span className="text-sm font-medium">$120 USD</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm font-medium">Total Comisiones</span>
                    <span className="text-sm font-bold">$1,592 USD</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Historial de Pagos</CardTitle>
                <CardDescription>Últimas transacciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historial.map((viaje) => (
                    <div key={viaje.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{viaje.ruta}</p>
                        <p className="text-xs text-muted-foreground">{viaje.fecha}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{viaje.pago}</p>
                        <Badge variant="outline" className="text-xs">
                          Pagado
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  Ver Historial Completo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estadisticas" className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Estadísticas e Indicadores</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-primary">{estadisticas.porcentajeRetornoCargado}%</div>
                    <p className="text-sm text-muted-foreground">Viajes con Retorno Cargado</p>
                    <Badge variant="secondary" className="text-xs">
                      +12% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-secondary">{estadisticas.co2Ahorrado}</div>
                    <p className="text-sm text-muted-foreground">CO₂ Ahorrado</p>
                    <Badge variant="secondary" className="text-xs">
                      Impacto ambiental
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-accent">{estadisticas.eficienciaPromedio}%</div>
                    <p className="text-sm text-muted-foreground">Eficiencia Promedio</p>
                    <Badge variant="secondary" className="text-xs">
                      Excelente
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kilómetros Recorridos</CardTitle>
                <CardDescription>Análisis de rutas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Recorridos</p>
                    <p className="text-2xl font-bold">{estadisticas.kmRecorridos.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sin Carga</p>
                    <p className="text-2xl font-bold text-amber-600">{estadisticas.kmSinCarga.toLocaleString()} km</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Optimización de rutas</span>
                    <span className="font-medium">
                      {(
                        ((estadisticas.kmRecorridos - estadisticas.kmSinCarga) / estadisticas.kmRecorridos) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{
                        width: `${((estadisticas.kmRecorridos - estadisticas.kmSinCarga) / estadisticas.kmRecorridos) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Impacto Ambiental</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Reducción de emisiones equivalente a plantar 280 árboles
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rendimiento Mensual</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { mes: "Noviembre", viajes: 12, ingresos: "$18,400" },
                    { mes: "Octubre", viajes: 15, ingresos: "$22,100" },
                    { mes: "Septiembre", viajes: 11, ingresos: "$16,800" },
                    { mes: "Agosto", viajes: 14, ingresos: "$20,500" },
                  ].map((dato, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{dato.mes}</p>
                        <p className="text-xs text-muted-foreground">{dato.viajes} viajes</p>
                      </div>
                      <p className="text-sm font-bold">{dato.ingresos}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Mi Perfil</h2>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20">
                    <AvatarFallback className="text-xl md:text-2xl">JC</AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left flex-1">
                    <CardTitle className="text-lg md:text-xl">{transportista.nombre}</CardTitle>
                    <CardDescription>Transportista Profesional</CardDescription>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                      <Badge>⭐ {transportista.calificacion}</Badge>
                      <Badge variant="secondary">{transportista.viajesCompletados} viajes</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium break-all">{transportista.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-sm font-medium">{transportista.telefono}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Historial Reciente</h3>
                  <div className="space-y-2">
                    {historial.slice(0, 3).map((viaje) => (
                      <div key={viaje.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{viaje.ruta}</p>
                          <p className="text-xs text-muted-foreground">{viaje.fecha}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{viaje.pago}</p>
                          <div className="flex">
                            {Array.from({ length: viaje.calificacion }).map((_, i) => (
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
        <div className="grid grid-cols-5 h-16">
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
            onClick={() => setActiveTab("cargas-disponibles")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "cargas-disponibles" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">Cargas</span>
          </button>
          <button
            onClick={() => setActiveTab("mis-cargas")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "mis-cargas" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Navigation className="h-5 w-5" />
            <span className="text-xs">Activas</span>
          </button>
          <button
            onClick={() => setActiveTab("facturacion")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "facturacion" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Pagos</span>
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

      <Dialog open={showCargaDetails} onOpenChange={setShowCargaDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Carga</DialogTitle>
            <DialogDescription>Información completa del envío</DialogDescription>
          </DialogHeader>
          {selectedCarga && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Origen</Label>
                  <p className="font-medium">{selectedCarga.origen}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Destino</Label>
                  <p className="font-medium">{selectedCarga.destino}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo de Carga</Label>
                  <p className="font-medium">{selectedCarga.carga}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Peso</Label>
                  <p className="font-medium">{selectedCarga.peso}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Distancia</Label>
                  <p className="font-medium">{selectedCarga.distancia}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Pago</Label>
                  <p className="font-medium text-primary">{selectedCarga.pago}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fecha de Carga</Label>
                  <p className="font-medium">{selectedCarga.fechaCarga}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Empresa</Label>
                  <p className="font-medium">{selectedCarga.empresa}</p>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Requisitos Especiales</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Seguro de carga incluido</li>
                  <li>• Temperatura controlada no requerida</li>
                  <li>• Documentación aduanera incluida</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCargaDetails(false)}>
              Cerrar
            </Button>
            <Button
              onClick={() => {
                if (selectedCarga) handleAceptarCarga(selectedCarga.id)
              }}
            >
              Aceptar Carga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contactar Empresa</DialogTitle>
            <DialogDescription>Envía un mensaje a la empresa sobre esta carga</DialogDescription>
          </DialogHeader>
          {selectedCarga && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedCarga.carga || selectedCarga.empresa}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedCarga.origen} → {selectedCarga.destino}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Mensaje</Label>
                <Textarea
                  placeholder="Escribe tu mensaje aquí..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEnviarMensaje}>Enviar Mensaje</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Estado del Envío</DialogTitle>
            <DialogDescription>Informa el estado actual de tu carga</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Estado Actual</Label>
              <Select value={estadoActualizacion} onValueChange={setEstadoActualizacion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cargando">Cargando mercancía</SelectItem>
                  <SelectItem value="en_ruta">En ruta</SelectItem>
                  <SelectItem value="parada">Parada técnica</SelectItem>
                  <SelectItem value="aduana">En aduana</SelectItem>
                  <SelectItem value="descargando">Descargando</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comentarios adicionales (opcional)</Label>
              <Textarea placeholder="Agrega detalles sobre el estado..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleActualizarEstado}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLocationPermission} onOpenChange={setShowLocationPermission}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-primary" />
              Permiso de Ubicación
            </DialogTitle>
            <DialogDescription>
              CargoConnect necesita acceso a tu ubicación para funcionar correctamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">¿Por qué necesitamos tu ubicación?</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Calcular distancias a cargas disponibles</li>
                <li>✓ Mostrar solo cargas compatibles con tu ruta</li>
                <li>✓ Permitir que empresas vean si estás cerca</li>
                <li>✓ Optimizar tus viajes de retorno</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Sistema de compatibilidad:</strong>
                <br />🟢 Verde: Estás cerca (0-200 km)
                <br />🟠 Naranja: Distancia media (200-500 km)
                <br />🔴 Rojo: Muy lejos (+500 km)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLocationPermission(false)}>
              Ahora no
            </Button>
            <Button onClick={handleEnableLocation}>Activar Ubicación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
