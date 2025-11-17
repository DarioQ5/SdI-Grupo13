from sqlalchemy import Boolean, Column, Integer, String, Numeric, Text, DateTime, ForeignKey, Date, SmallInteger, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(Text, unique=True, nullable=False, index=True)
    hash = Column(Text, nullable=False)
    estado = Column(String(20), default="activo")
    rol_global = Column(String(20), nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    proveedor = relationship("Proveedor", back_populates="usuario", uselist=False)
    transportista = relationship("Transportista", back_populates="usuario", uselist=False)
    administrador = relationship("Administrador", back_populates="usuario")
    notificaciones = relationship("Notificacion", back_populates="usuario")


class Administrador(Base):
    __tablename__ = "administradores"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    nombre_completo = Column(Text)
    telefono = Column(String(30))
    permisos = Column(Text, default="todos")
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="administrador")


class Proveedor(Base):
    __tablename__ = "proveedores"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    razon_social = Column(Text)
    cuit = Column(String(20))
    telefono = Column(String(30))
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="proveedor")
    ordenes = relationship("OrdenCarga", back_populates="proveedor")


class Transportista(Base):
    __tablename__ = "transportistas"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    cuil_cuit = Column(String(20))
    telefono = Column(String(30))
    disponible = Column(Boolean, default=True)
    ubicacion_actual_lat = Column(Numeric(9, 6))
    ubicacion_actual_lon = Column(Numeric(9, 6))
    viajes_completados = Column(Integer, default=0)
    reputacion = Column(Numeric(3, 2), default=5.0)
    cantidad_calificaciones = Column(Integer, default=0)
    emisiones_co2_total = Column(Numeric(12, 2), default=0)
    co2_ahorrado = Column(Numeric(12, 2), default=0)
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="transportista")
    camiones = relationship("Camion", back_populates="transportista")
    viajes = relationship("Viaje", back_populates="transportista")
    calificaciones = relationship("Calificacion", back_populates="transportista")


class TipoCamion(Base):
    __tablename__ = "tipos_camion"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(Text, nullable=False)
    ejes = Column(SmallInteger)
    largo_m = Column(Numeric(5, 2))
    alto_m = Column(Numeric(5, 2))
    
    # Relaciones
    camiones = relationship("Camion", back_populates="tipo_camion")


class Camion(Base):
    __tablename__ = "camiones"
    
    id = Column(Integer, primary_key=True, index=True)
    transportista_id = Column(Integer, ForeignKey("transportistas.id"), nullable=False)
    patente = Column(String(10), unique=True, nullable=False)
    tipo_camion_id = Column(Integer, ForeignKey("tipos_camion.id"))
    capacidad_kg = Column(Numeric(10, 2))
    volumen_m3 = Column(Numeric(10, 2))
    reefer = Column(Boolean, default=False)
    adr = Column(Boolean, default=False)
    combustible = Column(String(20), default="Diesel")
    
    # Relaciones
    transportista = relationship("Transportista", back_populates="camiones")
    tipo_camion = relationship("TipoCamion", back_populates="camiones")


class TipoCarga(Base):
    __tablename__ = "tipos_carga"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(Text, nullable=False)
    requiere_reefer = Column(Boolean, default=False)
    adr_clase = Column(String(10))
    
    # Relaciones
    ordenes = relationship("OrdenCarga", back_populates="tipo_carga")


class Origen(Base):
    __tablename__ = "origen"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(Text, nullable=False)
    tipo = Column(String(20))
    lat = Column(Numeric(10, 7))  # Increased from (9, 6) to (10, 7) for more precision
    lon = Column(Numeric(10, 7))  # Increased from (9, 6) to (10, 7) for more precision
    provincia = Column(Text)


class OrdenCarga(Base):
    __tablename__ = "ordenes_carga"
    
    id = Column(Integer, primary_key=True, index=True)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"), nullable=False)
    tipo_carga_id = Column(Integer, ForeignKey("tipos_carga.id"))
    peso_kg = Column(Numeric(12, 2))
    volumen_m3 = Column(Numeric(12, 2))
    origen_id = Column(Integer, ForeignKey("origen.id"), nullable=False)
    destino_id = Column(Integer, ForeignKey("origen.id"), nullable=False)
    ventana_desde = Column(DateTime(timezone=True))
    ventana_hasta = Column(DateTime(timezone=True))
    req_reefer = Column(Boolean, default=False)
    req_adr = Column(Boolean, default=False)
    estado = Column(String(20), nullable=False, default="publicada")
    creada_en = Column(DateTime(timezone=True), server_default=func.now())
    precio = Column(Numeric(12, 2))
    distancia_km = Column(Numeric(10, 2))
    co2_estimado = Column(Numeric(12, 2))
    co2_ahorrado = Column(Numeric(12, 2), default=0)
    transportista_asignado_id = Column(Integer, ForeignKey("transportistas.id"))
    completada_en = Column(DateTime(timezone=True))
    
    # Relaciones
    proveedor = relationship("Proveedor", back_populates="ordenes")
    tipo_carga = relationship("TipoCarga", back_populates="ordenes")
    calificaciones = relationship("Calificacion", back_populates="orden")


class Viaje(Base):
    __tablename__ = "viajes"
    
    id = Column(Integer, primary_key=True, index=True)
    transportista_id = Column(Integer, ForeignKey("transportistas.id"), nullable=False)
    orden_id = Column(Integer, ForeignKey("ordenes_carga.id"))
    origen_id = Column(Integer, ForeignKey("origen.id"), nullable=False)
    destino_id = Column(Integer, ForeignKey("origen.id"), nullable=False)
    ubicacion_actual_lat = Column(Numeric(9, 6))
    ubicacion_actual_lon = Column(Numeric(9, 6))
    distancia_total_km = Column(Numeric(10, 2))
    distancia_recorrida_km = Column(Numeric(10, 2), default=0)
    tiempo_estimado_minutos = Column(Integer)
    tiempo_transcurrido_minutos = Column(Integer, default=0)
    estado = Column(String(20), default="en_progreso")  # en_progreso, entregado, finalizado, completado
    fecha_inicio = Column(DateTime(timezone=True))
    fecha_fin = Column(DateTime(timezone=True))
    tiempo_entrega_esperado = Column(DateTime(timezone=True))  # When delivery is expected
    tiempo_entrega_real = Column(DateTime(timezone=True))  # When actually delivered
    cumple_plazo = Column(Boolean)  # Whether delivery was on time
    ultima_actualizacion = Column(DateTime(timezone=True), server_default=func.now())
    detenido_minutos = Column(Integer, default=0)
    ruta_completa = Column(Text)  # JSON string with route coordinates
    
    # Relaciones
    transportista = relationship("Transportista", back_populates="viajes")

class Notificacion(Base):
    __tablename__ = "notificaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    evento = Column(Text)
    payload_json = Column(Text)
    leida = Column(Boolean, default=False)
    ts_envio = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="notificaciones")


class Calificacion(Base):
    __tablename__ = "calificaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    orden_id = Column(Integer, ForeignKey("ordenes_carga.id"), nullable=False)
    transportista_id = Column(Integer, ForeignKey("transportistas.id"), nullable=False)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"), nullable=False)
    puntuacion = Column(SmallInteger, nullable=False)  # 1-5 estrellas
    comentario = Column(Text)
    puntualidad = Column(SmallInteger)  # 1-5
    cuidado_carga = Column(SmallInteger)  # 1-5
    comunicacion = Column(SmallInteger)  # 1-5
    cumple_plazo = Column(Boolean)  # Whether delivery was on time
    tiempo_demora_horas = Column(Integer)  # Hours late (if any)
    creada_en = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    orden = relationship("OrdenCarga", back_populates="calificaciones")
    transportista = relationship("Transportista", back_populates="calificaciones")
    proveedor = relationship("Proveedor")
