from pydantic import BaseModel, EmailStr
from typing import Optional, List, Union, Any
from datetime import datetime
from decimal import Decimal

# ============== AUTH SCHEMAS ==============

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    usuario: Any  # Allow any user type
    perfil: Any  # Allow any profile type (Admin, Proveedor, Transportista)
    tipo: str
    camion: Optional[Any] = None  # Optional truck for transportistas
    
    class Config:
        from_attributes = True  # Allow SQLAlchemy models to be serialized

class RegistroProveedor(BaseModel):
    email: EmailStr
    password: str
    razon_social: str
    cuit: str
    telefono: str

class RegistroTransportista(BaseModel):
    email: EmailStr
    password: str
    cuil_cuit: str
    telefono: str
    patente: str
    tipo_camion: str
    capacidad_kg: float
    volumen_m3: Optional[float]
    reefer: bool = False
    adr: bool = False
    combustible: str = "diesel"

# ============== TRANSPORTISTA SCHEMAS ==============

class CamionInfo(BaseModel):
    id: int
    patente: str
    tipo_camion: str
    capacidad_kg: float
    volumen_m3: float
    reefer: bool
    adr: bool
    combustible: str

class TransportistaDetalle(BaseModel):
    id: int
    usuario_id: int
    nombre: str
    cuil_cuit: Optional[str]
    telefono: Optional[str]
    disponible: bool
    ubicacion_actual_lat: Optional[float]
    ubicacion_actual_lon: Optional[float]
    camion: Optional[CamionInfo]
    viajes_completados: int
    reputacion: float
    emisiones_co2_total: float

class DisponibilidadUpdate(BaseModel):
    disponible: bool

# ============== ORDEN/OFERTA SCHEMAS ==============

class OrdenCargaCreate(BaseModel):
    proveedor_id: int
    transportista_id: Optional[int]
    tipo_carga: str
    peso_kg: float
    volumen_m3: Optional[float]
    origen: Optional[str] = None  # Opcional, para descripción
    destino: Optional[str] = None  # Opcional, para descripción
    origen_lat: float  # Latitud exacta del origen
    origen_lon: float  # Longitud exacta del origen
    destino_lat: float  # Latitud exacta del destino
    destino_lon: float  # Longitud exacta del destino
    ventana_desde: Optional[datetime]
    ventana_hasta: Optional[datetime]
    req_reefer: bool = False
    req_adr: bool = False
    precio: float
    distancia_km: float
    co2_estimado: float

class OrdenCargaDetalle(BaseModel):
    id: int
    proveedor_id: int
    tipo_carga: str
    peso_kg: float
    volumen_m3: float
    origen: str
    destino: str
    ventana_desde: Optional[str]
    ventana_hasta: Optional[str]
    req_reefer: bool
    req_adr: bool
    estado: str
    precio: float
    distancia_km: float
    co2_estimado: float
    creada_en: str

class EstadoOrdenUpdate(BaseModel):
    estado: str  # "aceptada", "rechazada", "en_progreso", "completada"
    transportista_id: Optional[int] = None  # Added transportista_id to pass when accepting an order

class EstadoViajeUpdate(BaseModel):
    estado: str  # "en_progreso", "entregado", "finalizado", "completado"

# ============== VIAJE SCHEMAS ==============

class ViajeDetalle(BaseModel):
    id: int
    transportista_id: int
    orden_id: Optional[int]
    proveedor_id: Optional[int]
    origen: str
    destino: str
    origen_lat: float
    origen_lon: float
    destino_lat: float
    destino_lon: float
    ubicacion_actual_lat: float
    ubicacion_actual_lon: float
    distancia_total_km: float
    distancia_recorrida_km: float
    tiempo_estimado_minutos: int
    tiempo_transcurrido_minutos: int
    estado: str
    fecha_inicio: Optional[str]
    fecha_fin: Optional[str]
    ultima_actualizacion: Optional[str]
    detenido_minutos: int
    ruta_completa: Optional[List[dict]] = None  # Added ruta_completa field to include route coordinates

# ============== NOTIFICACIÓN SCHEMAS ==============

class NotificacionDetalle(BaseModel):
    id: int
    usuario_id: int
    evento: str
    payload_json: Optional[str]
    leida: bool
    ts_envio: datetime

    class Config:
        from_attributes = True

# ============== CALIFICACIÓN SCHEMAS ==============

class CalificacionCreate(BaseModel):
    orden_id: int
    transportista_id: int
    proveedor_id: int
    puntuacion: int  # 1-5
    comentario: Optional[str]
    puntualidad: Optional[int]
    cuidado_carga: Optional[int]
    comunicacion: Optional[int]

class CalificacionDetalle(BaseModel):
    id: int
    orden_id: int
    transportista_id: int
    proveedor_id: int
    puntuacion: int
    comentario: Optional[str]
    puntualidad: Optional[int]
    cuidado_carga: Optional[int]
    comunicacion: Optional[int]
    creada_en: datetime
    
    class Config:
        from_attributes = True

# ============== ADMINISTRADOR SCHEMAS ==============

class UsuarioAdmin(BaseModel):
    id: int
    email: str
    estado: str
    rol_global: str
    creado_en: datetime

class EstadisticasAdmin(BaseModel):
    total_usuarios: int
    total_proveedores: int
    total_transportistas: int
    total_ordenes: int
    ordenes_completadas: int
    ordenes_en_progreso: int
    co2_total_emitido: float
    co2_total_ahorrado: float
    viajes_completados: int
    ingresos_totales: float
    reputacion_promedio: float
    
class ActividadReciente(BaseModel):
    tipo: str
    descripcion: str
    fecha: datetime
    usuario_id: Optional[int]

class UsuarioUpdate(BaseModel):
    estado: Optional[str]
    email: Optional[str]
