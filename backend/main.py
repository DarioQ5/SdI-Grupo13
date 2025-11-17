from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func
import models
import schemas
import os
from dotenv import load_dotenv
import json
import httpx
import math # Added for calcular_distancia_recorrida

load_dotenv()

# Leer ALLOWED_ORIGINS del .env
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    allowed_origins = [
        "http://localhost:3000"
    ]

app = FastAPI(title="Plataforma Logística API", version="1.0.0")

# CORS CONFIG
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],     # también lo podés dejar así
    allow_headers=["*"],
)

# Dependencia DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============== AUTH ENDPOINTS ==============

@app.post("/api/auth/registro/proveedor", response_model=schemas.LoginResponse)
def registro_proveedor(datos: schemas.RegistroProveedor, db: Session = Depends(get_db)):
    """Registro de nuevo proveedor"""
    # Verificar que el email no existe
    usuario_existente = db.query(models.Usuario).filter(
        models.Usuario.email == datos.email
    ).first()
    
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Crear usuario
    nuevo_usuario = models.Usuario(
        email=datos.email,
        hash=datos.password,  # En producción usar hash real
        rol_global="proveedor",
        estado="activo"
    )
    db.add(nuevo_usuario)
    db.flush()
    
    # Crear proveedor
    nuevo_proveedor = models.Proveedor(
        usuario_id=nuevo_usuario.id,
        razon_social=datos.razon_social,
        cuit=datos.cuit,
        telefono=datos.telefono
    )
    db.add(nuevo_proveedor)
    db.commit()
    db.refresh(nuevo_proveedor)
    
    return {
        "usuario": nuevo_usuario,
        "perfil": nuevo_proveedor,
        "tipo": "proveedor"
    }

@app.post("/api/auth/registro/transportista", response_model=schemas.LoginResponse)
def registro_transportista(datos: schemas.RegistroTransportista, db: Session = Depends(get_db)):
    """Registro de nuevo transportista"""
    # Verificar que el email no existe
    usuario_existente = db.query(models.Usuario).filter(
        models.Usuario.email == datos.email
    ).first()
    
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Crear usuario
    nuevo_usuario = models.Usuario(
        email=datos.email,
        hash=datos.password,  # En producción usar hash real
        rol_global="transportista",
        estado="activo"
    )
    db.add(nuevo_usuario)
    db.flush()
    
    # Crear transportista
    nuevo_transportista = models.Transportista(
        usuario_id=nuevo_usuario.id,
        cuil_cuit=datos.cuil_cuit,
        telefono=datos.telefono,
        disponible=False,
        ubicacion_actual_lat=40.4168,  # Madrid por defecto
        ubicacion_actual_lon=-3.7038,
        viajes_completados=0,
        reputacion=5.0,
        emisiones_co2_total=0
    )
    db.add(nuevo_transportista)
    db.flush()
    
    # Buscar tipo de camión
    tipo_camion = db.query(models.TipoCamion).filter(
        models.TipoCamion.nombre == datos.tipo_camion
    ).first()
    
    if not tipo_camion:
        tipo_camion = db.query(models.TipoCamion).first()
    
    # Crear camión
    nuevo_camion = models.Camion(
        transportista_id=nuevo_transportista.id,
        tipo_camion_id=tipo_camion.id if tipo_camion else 1,
        patente=datos.patente,
        capacidad_kg=datos.capacidad_kg,
        volumen_m3=datos.volumen_m3,
        reefer=datos.reefer,
        adr=datos.adr,
        combustible=datos.combustible
    )
    db.add(nuevo_camion)
    db.commit()
    db.refresh(nuevo_transportista)
    db.refresh(nuevo_camion)
    
    return {
        "usuario": nuevo_usuario,
        "perfil": nuevo_transportista,
        "camion": nuevo_camion,
        "tipo": "transportista"
    }

@app.post("/api/auth/login")
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Login para proveedores, transportistas y admin"""
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == credentials.email
    ).first()
    
    if not usuario or usuario.hash != credentials.password:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # Si es admin, devolver datos de admin
    if usuario.rol_global == "admin":
        administrador = db.query(models.Administrador).filter(
            models.Administrador.usuario_id == usuario.id
        ).first()
        return {
            "usuario": {
                "id": usuario.id,
                "email": usuario.email,
                "rol_global": usuario.rol_global,
                "estado": usuario.estado,
                "creado_en": usuario.creado_en.isoformat() if usuario.creado_en else None
            },
            "perfil": {
                "id": administrador.id if administrador else None,
                "nombre_completo": administrador.nombre_completo if administrador else None,
                "telefono": administrador.telefono if administrador else None,
                "permisos": administrador.permisos if administrador else "todos"
            } if administrador else {},
            "tipo": "admin"
        }
    
    # Obtener perfil según el rol
    if usuario.rol_global == "proveedor":
        proveedor = db.query(models.Proveedor).filter(
            models.Proveedor.usuario_id == usuario.id
        ).first()
        return {
            "usuario": {
                "id": usuario.id,
                "email": usuario.email,
                "rol_global": usuario.rol_global,
                "estado": usuario.estado,
                "creado_en": usuario.creado_en.isoformat() if usuario.creado_en else None
            },
            "perfil": {
                "id": proveedor.id if proveedor else None,
                "razon_social": proveedor.razon_social if proveedor else None,
                "cuit": proveedor.cuit if proveedor else None,
                "telefono": proveedor.telefono if proveedor else None
            } if proveedor else {},
            "tipo": "proveedor"
        }
    elif usuario.rol_global == "transportista":
        transportista = db.query(models.Transportista).filter(
            models.Transportista.usuario_id == usuario.id
        ).first()
        # Obtener camión del transportista
        camion = db.query(models.Camion).filter(
            models.Camion.transportista_id == transportista.id
        ).first() if transportista else None
        
        tipo_camion = None
        if camion:
            tipo_camion_obj = db.query(models.TipoCamion).filter(
                models.TipoCamion.id == camion.tipo_camion_id
            ).first()
            tipo_camion = tipo_camion_obj.nombre if tipo_camion_obj else "Camión"
        
        return {
            "usuario": {
                "id": usuario.id,
                "email": usuario.email,
                "rol_global": usuario.rol_global,
                "estado": usuario.estado,
                "creado_en": usuario.creado_en.isoformat() if usuario.creado_en else None
            },
            "perfil": {
                "id": transportista.id if transportista else None,
                "cuil_cuit": transportista.cuil_cuit if transportista else None,
                "telefono": transportista.telefono if transportista else None,
                "disponible": transportista.disponible if transportista else False,
                "ubicacion_actual_lat": float(transportista.ubicacion_actual_lat) if transportista and transportista.ubicacion_actual_lat else None,
                "ubicacion_actual_lon": float(transportista.ubicacion_actual_lon) if transportista and transportista.ubicacion_actual_lon else None,
                "viajes_completados": transportista.viajes_completados if transportista else 0,
                "reputacion": float(transportista.reputacion) if transportista else 5.0,
                "emisiones_co2_total": float(transportista.emisiones_co2_total) if transportista else 0
            } if transportista else {},
            "camion": {
                "id": camion.id,
                "patente": camion.patente,
                "tipo_camion": tipo_camion,
                "capacidad_kg": float(camion.capacidad_kg),
                "volumen_m3": float(camion.volumen_m3) if camion.volumen_m3 else 0,
                "reefer": camion.reefer,
                "adr": camion.adr,
                "combustible": camion.combustible
            } if camion else None,
            "tipo": "transportista"
        }
    
    raise HTTPException(status_code=400, detail="Tipo de usuario no soportado")

@app.post("/api/admin/login")
def admin_login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Login para administradores"""
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == credentials.email
    ).first()
    
    if not usuario or usuario.hash != credentials.password or usuario.rol_global != "admin":
        raise HTTPException(status_code=401, detail="Credenciales inválidas o acceso no autorizado")
    
    administrador = db.query(models.Administrador).filter(
        models.Administrador.usuario_id == usuario.id
    ).first()
    
    return {
        "usuario": {
            "id": usuario.id,
            "email": usuario.email,
            "rol_global": usuario.rol_global,
            "estado": usuario.estado,
            "creado_en": usuario.creado_en.isoformat() if usuario.creado_en else None
        },
        "perfil": {
            "id": administrador.id if administrador else None,
            "nombre_completo": administrador.nombre_completo if administrador else None,
            "telefono": administrador.telefono if administrador else None,
            "permisos": administrador.permisos if administrador else "todos"
        } if administrador else {},
        "tipo": "admin"
    }

# ============== TRANSPORTISTA ENDPOINTS ==============

@app.get("/api/transportistas", response_model=List[schemas.TransportistaDetalle])
def listar_transportistas(
    disponible: Optional[bool] = None,
    tipo_camion: Optional[str] = None,
    reefer: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Listar transportistas con sus camiones"""
    query = db.query(models.Transportista)
    
    transportistas = query.all()
    resultado = []
    
    for t in transportistas:
        camion = db.query(models.Camion).filter(
            models.Camion.transportista_id == t.id
        ).first()
        
        if not camion:
            continue
            
        tipo_camion_obj = db.query(models.TipoCamion).filter(
            models.TipoCamion.id == camion.tipo_camion_id
        ).first()
        
        # Aplicar filtros
        if disponible is not None and t.disponible != disponible:
            continue
        if tipo_camion and tipo_camion_obj and tipo_camion_obj.nombre != tipo_camion:
            continue
        if reefer is not None and camion.reefer != reefer:
            continue
        
        resultado.append({
            "id": t.id,
            "usuario_id": t.usuario_id,
            "nombre": f"Transportista {t.id}",
            "cuil_cuit": t.cuil_cuit,
            "telefono": t.telefono,
            "disponible": t.disponible,
            "ubicacion_actual_lat": t.ubicacion_actual_lat,
            "ubicacion_actual_lon": t.ubicacion_actual_lon,
            "camion": {
                "id": camion.id,
                "patente": camion.patente,
                "tipo_camion": tipo_camion_obj.nombre if tipo_camion_obj else "Camión",
                "capacidad_kg": float(camion.capacidad_kg),
                "volumen_m3": float(camion.volumen_m3) if camion.volumen_m3 else 0,
                "reefer": camion.reefer,
                "adr": camion.adr,
                "combustible": camion.combustible
            },
            "viajes_completados": t.viajes_completados,
            "reputacion": float(t.reputacion),
            "emisiones_co2_total": float(t.emisiones_co2_total)
        })
    
    return resultado


@app.put("/api/transportistas/{transportista_id}/disponibilidad")
def actualizar_disponibilidad(
    transportista_id: int,
    disponibilidad: schemas.DisponibilidadUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar disponibilidad del transportista"""
    transportista = db.query(models.Transportista).filter(
        models.Transportista.id == transportista_id
    ).first()
    
    if not transportista:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    
    transportista.disponible = disponibilidad.disponible
    db.commit()
    
    return {"message": "Disponibilidad actualizada", "disponible": transportista.disponible}


@app.get("/api/transportistas/{transportista_id}/perfil")
def obtener_perfil_transportista(transportista_id: int, db: Session = Depends(get_db)):
    """Obtener perfil completo del transportista"""
    transportista = db.query(models.Transportista).filter(
        models.Transportista.id == transportista_id
    ).first()
    
    if not transportista:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    
    camion = db.query(models.Camion).filter(
        models.Camion.transportista_id == transportista.id
    ).first()
    
    tipo_camion = None
    if camion:
        tipo_camion = db.query(models.TipoCamion).filter(
            models.TipoCamion.id == camion.tipo_camion_id
        ).first()
    
    return {
        "transportista": transportista,
        "camion": camion,
        "tipo_camion": tipo_camion.nombre if tipo_camion else None
    }

@app.put("/api/transportistas/{transportista_id}/ubicacion")
async def actualizar_ubicacion_transportista(
    transportista_id: int,
    ubicacion: dict,
    db: Session = Depends(get_db)
):
    """Actualizar ubicación GPS del transportista en tiempo real"""
    transportista = db.query(models.Transportista).filter(
        models.Transportista.id == transportista_id
    ).first()
    
    if not transportista:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    
    transportista.ubicacion_actual_lat = ubicacion.get("ubicacion_actual_lat")
    transportista.ubicacion_actual_lon = ubicacion.get("ubicacion_actual_lon")
    
    # Actualizar también los viajes activos del transportista
    viajes_activos = db.query(models.Viaje).filter(
        models.Viaje.transportista_id == transportista_id,
        models.Viaje.estado == "en_progreso"
    ).all()
    
    for viaje in viajes_activos:
        viaje.ubicacion_actual_lat = ubicacion.get("ubicacion_actual_lat")
        viaje.ubicacion_actual_lon = ubicacion.get("ubicacion_actual_lon")
        viaje.ultima_actualizacion = datetime.now()
        
        # Calcular distancia recorrida si hay ruta completa
        if viaje.ruta_completa:
            try:
                ruta = json.loads(viaje.ruta_completa)
                # Calcular distancia recorrida basándose en la posición actual
                # (esto es una aproximación simple, se puede mejorar)
                distancia_recorrida = calcular_distancia_recorrida(
                    ruta,
                    float(ubicacion.get("ubicacion_actual_lat")),
                    float(ubicacion.get("ubicacion_actual_lon"))
                )
                viaje.distancia_recorrida_km = distancia_recorrida
            except Exception as e:
                print(f"[v1] Error calculando distancia recorrida para viaje {viaje.id}: {e}")
    
    db.commit()
    
    return {
        "message": "Ubicación actualizada",
        "ubicacion_actual_lat": float(transportista.ubicacion_actual_lat),
        "ubicacion_actual_lon": float(transportista.ubicacion_actual_lon)
    }

def calcular_distancia_recorrida(ruta, lat_actual, lon_actual):
    """Calcula la distancia recorrida en la ruta hasta la posición actual"""
    # No es necesario importar math aquí ya que está importado al inicio del archivo
    
    def distancia_haversine(lat1, lon1, lat2, lon2):
        R = 6371  # Radio de la Tierra en km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
    
    # Encontrar el punto más cercano en la ruta
    distancia_min = float('inf')
    indice_cercano = 0
    
    for i, punto in enumerate(ruta):
        # Asegurarse de que los puntos tengan claves 'lat' y 'lng'
        if 'lat' in punto and 'lng' in punto:
            dist = distancia_haversine(lat_actual, lon_actual, punto['lat'], punto['lng'])
            if dist < distancia_min:
                distancia_min = dist
                indice_cercano = i
        else:
            print(f"[v1] Advertencia: Punto de ruta sin 'lat' o 'lng': {punto}")

    # Sumar distancias hasta el punto más cercano
    distancia_total = 0
    for i in range(indice_cercano):
        if i + 1 < len(ruta) and 'lat' in ruta[i] and 'lng' in ruta[i] and 'lat' in ruta[i+1] and 'lng' in ruta[i+1]:
            distancia_total += distancia_haversine(
                ruta[i]['lat'], ruta[i]['lng'],
                ruta[i + 1]['lat'], ruta[i + 1]['lng']
            )
        else:
             print(f"[v1] Advertencia: Puntos de ruta inválidos al calcular distancia total.")
    
    return distancia_total


@app.get("/api/transportistas/{transportista_id}/estadisticas")
def obtener_estadisticas_transportista(transportista_id: int, db: Session = Depends(get_db)):
    """Obtener estadísticas completas del transportista"""
    transportista = db.query(models.Transportista).filter(
        models.Transportista.id == transportista_id
    ).first()
    
    if not transportista:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    
    # Viajes completados
    viajes_completados = db.query(models.Viaje).filter(
        models.Viaje.transportista_id == transportista_id,
        models.Viaje.estado == "completado"
    ).count()
    
    # Viajes en progreso
    viajes_en_progreso = db.query(models.Viaje).filter(
        models.Viaje.transportista_id == transportista_id,
        models.Viaje.estado == "en_progreso"
    ).count()
    
    # Ofertas aceptadas
    ofertas_aceptadas = db.query(models.OrdenCarga).filter(
        models.OrdenCarga.transportista_asignado_id == transportista_id,
        models.OrdenCarga.estado == "aceptada"
    ).count()
    
    # Ingresos totales
    ingresos_totales = db.query(func.sum(models.OrdenCarga.precio)).filter(
        models.OrdenCarga.transportista_asignado_id == transportista_id,
        models.OrdenCarga.estado == "completada"
    ).scalar() or 0
    
    # Distancia total
    distancia_total = db.query(func.sum(models.Viaje.distancia_total_km)).filter(
        models.Viaje.transportista_id == transportista_id,
        models.Viaje.estado == "completado"
    ).scalar() or 0
    
    # Calcular promedios
    co2_promedio_viaje = (
        float(transportista.emisiones_co2_total) / viajes_completados 
        if viajes_completados > 0 else 0
    )
    
    ingreso_promedio_viaje = (
        float(ingresos_totales) / viajes_completados 
        if viajes_completados > 0 else 0
    )
    
    # Tasa de aceptación
    total_ofertas_recibidas = db.query(models.OrdenCarga).filter(
        models.OrdenCarga.transportista_asignado_id == transportista_id
    ).count()
    
    tasa_aceptacion = (
        (ofertas_aceptadas / total_ofertas_recibidas * 100) 
        if total_ofertas_recibidas > 0 else 0
    )
    
    return {
        "viajes_completados": viajes_completados,
        "viajes_en_progreso": viajes_en_progreso,
        "ofertas_aceptadas": ofertas_aceptadas,
        "reputacion": float(transportista.reputacion),
        "cantidad_calificaciones": transportista.cantidad_calificaciones,
        "emisiones_co2_total": float(transportista.emisiones_co2_total),
        "co2_ahorrado": float(transportista.co2_ahorrado) if transportista.co2_ahorrado else 0,
        "co2_promedio_viaje": co2_promedio_viaje,
        "ingresos_totales": float(ingresos_totales),
        "ingreso_promedio_viaje": ingreso_promedio_viaje,
        "distancia_total_km": float(distancia_total),
        "tasa_aceptacion": round(tasa_aceptacion, 1)
    }

# ============== OFERTAS/ORDENES ENDPOINTS ==============

@app.get("/api/ordenes", response_model=List[schemas.OrdenCargaDetalle])
def listar_ordenes(
    proveedor_id: Optional[int] = None,
    transportista_id: Optional[int] = None,
    estado: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Listar órdenes de carga"""
    query = db.query(models.OrdenCarga)
    
    if proveedor_id:
        query = query.filter(models.OrdenCarga.proveedor_id == proveedor_id)
    if estado:
        query = query.filter(models.OrdenCarga.estado == estado)
    
    ordenes = query.all()
    resultado = []
    
    for orden in ordenes:
        origen = db.query(models.Origen).filter(models.Origen.id == orden.origen_id).first()
        destino = db.query(models.Origen).filter(models.Origen.id == orden.destino_id).first()
        tipo_carga = db.query(models.TipoCarga).filter(models.TipoCarga.id == orden.tipo_carga_id).first()
        
        resultado.append({
            "id": orden.id,
            "proveedor_id": orden.proveedor_id,
            "tipo_carga": tipo_carga.nombre if tipo_carga else "Carga general",
            "peso_kg": float(orden.peso_kg),
            "volumen_m3": float(orden.volumen_m3) if orden.volumen_m3 else 0,
            "origen": origen.nombre if origen else "Origen",
            "destino": destino.nombre if destino else "Destino",
            "ventana_desde": orden.ventana_desde.isoformat() if orden.ventana_desde else None,
            "ventana_hasta": orden.ventana_hasta.isoformat() if orden.ventana_hasta else None,
            "req_reefer": orden.req_reefer,
            "req_adr": orden.req_adr,
            "estado": orden.estado,
            "precio": float(orden.precio) if orden.precio else 0,
            "distancia_km": float(orden.distancia_km) if orden.distancia_km else 0,
            "co2_estimado": float(orden.co2_estimado) if orden.co2_estimado else 0,
            "creada_en": orden.creada_en.isoformat()
        })
    
    return resultado


@app.post("/api/ordenes", response_model=schemas.OrdenCargaDetalle)
async def crear_orden(orden: schemas.OrdenCargaCreate, db: Session = Depends(get_db)):
    """Crear nueva orden de carga"""
    
    # Buscar o crear origen con coordenadas exactas
    origen = db.query(models.Origen).filter(
        models.Origen.lat == orden.origen_lat,
        models.Origen.lon == orden.origen_lon
    ).first()
    
    if not origen:
        origen = models.Origen(
            nombre=orden.origen or f"Ubicación ({orden.origen_lat:.4f}, {orden.origen_lon:.4f})",
            tipo="coordenada",
            lat=orden.origen_lat,
            lon=orden.origen_lon
        )
        db.add(origen)
        db.flush()
    
    # Buscar o crear destino con coordenadas exactas
    destino = db.query(models.Origen).filter(
        models.Origen.lat == orden.destino_lat,
        models.Origen.lon == orden.destino_lon
    ).first()
    
    if not destino:
        destino = models.Origen(
            nombre=orden.destino or f"Ubicación ({orden.destino_lat:.4f}, {orden.destino_lon:.4f})",
            tipo="coordenada",
            lat=orden.destino_lat,
            lon=orden.destino_lon
        )
        db.add(destino)
        db.flush()
    
    # Buscar o crear tipo de carga
    tipo_carga = db.query(models.TipoCarga).filter(
        models.TipoCarga.nombre == orden.tipo_carga
    ).first()
    if not tipo_carga:
        tipo_carga = models.TipoCarga(
            nombre=orden.tipo_carga,
            requiere_reefer=orden.req_reefer
        )
        db.add(tipo_carga)
        db.flush()
    
    nueva_orden = models.OrdenCarga(
        proveedor_id=orden.proveedor_id,
        tipo_carga_id=tipo_carga.id,
        peso_kg=orden.peso_kg,
        volumen_m3=orden.volumen_m3,
        origen_id=origen.id,
        destino_id=destino.id,
        ventana_desde=orden.ventana_desde,
        ventana_hasta=orden.ventana_hasta,
        req_reefer=orden.req_reefer,
        req_adr=orden.req_adr,
        estado="publicada",
        precio=orden.precio,
        distancia_km=orden.distancia_km,
        co2_estimado=orden.co2_estimado,
        transportista_asignado_id=orden.transportista_id
    )
    
    db.add(nueva_orden)
    db.commit()
    db.refresh(nueva_orden)
    
    return {
        "id": nueva_orden.id,
        "proveedor_id": nueva_orden.proveedor_id,
        "tipo_carga": tipo_carga.nombre,
        "peso_kg": float(nueva_orden.peso_kg),
        "volumen_m3": float(nueva_orden.volumen_m3) if nueva_orden.volumen_m3 else 0,
        "origen": origen.nombre,
        "destino": destino.nombre,
        "ventana_desde": nueva_orden.ventana_desde.isoformat() if nueva_orden.ventana_desde else None,
        "ventana_hasta": nueva_orden.ventana_hasta.isoformat() if nueva_orden.ventana_hasta else None,
        "req_reefer": nueva_orden.req_reefer,
        "req_adr": nueva_orden.req_adr,
        "estado": nueva_orden.estado,
        "precio": float(nueva_orden.precio) if nueva_orden.precio else 0,
        "distancia_km": float(nueva_orden.distancia_km) if nueva_orden.distancia_km else 0,
        "co2_estimado": float(nueva_orden.co2_estimado) if nueva_orden.co2_estimado else 0,
        "creada_en": nueva_orden.creada_en.isoformat()
    }


@app.put("/api/ordenes/{orden_id}/estado")
async def actualizar_estado_orden(
    orden_id: int,
    estado: schemas.EstadoOrdenUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar estado de una orden (aceptar/rechazar)"""
    orden = db.query(models.OrdenCarga).filter(models.OrdenCarga.id == orden_id).first()
    
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    if estado.estado == "aceptada" and hasattr(estado, 'transportista_id'):
        transportista_id = estado.transportista_id
        
        # Contar ofertas aceptadas actuales del transportista
        ofertas_aceptadas = db.query(models.OrdenCarga).filter(
            models.OrdenCarga.transportista_asignado_id == transportista_id,
            models.OrdenCarga.estado == "aceptada"
        ).count()
        
        if ofertas_aceptadas >= 2:
            raise HTTPException(
                status_code=400, 
                detail="Has alcanzado el límite de 2 ofertas aceptadas simultáneas. Completa o cancela una oferta antes de aceptar otra."
            )
        
        # Asignar transportista a la orden
        orden.transportista_asignado_id = transportista_id
    
    estado_anterior = orden.estado
    orden.estado = estado.estado
    
    # Si la orden fue aceptada, crear notificación al proveedor y crear viaje
    if estado.estado == "aceptada" and estado_anterior != "aceptada":
        # Obtener el transportista asignado
        transportista_id = estado.transportista_id if hasattr(estado, 'transportista_id') else orden.transportista_asignado_id
        
        if transportista_id:
            # Obtener el usuario del proveedor
            proveedor = db.query(models.Proveedor).filter(
                models.Proveedor.id == orden.proveedor_id
            ).first()
            
            if proveedor:
                # Obtener datos del transportista para la notificación
                transportista = db.query(models.Transportista).filter(
                    models.Transportista.id == transportista_id
                ).first()
                
                # Crear notificación para el proveedor
                nueva_notificacion = models.Notificacion(
                    usuario_id=proveedor.usuario_id,
                    evento=f"Oferta #{orden.id} aceptada",
                    payload_json=f'{{"orden_id": {orden.id}, "transportista_id": {transportista_id}, "tipo": "oferta_aceptada"}}',
                    leida=False
                )
                db.add(nueva_notificacion)
                
                origen = db.query(models.Origen).filter(models.Origen.id == orden.origen_id).first()
                destino = db.query(models.Origen).filter(models.Origen.id == orden.destino_id).first()
                
                ruta_data = None
                if origen and destino and origen.lon is not None and origen.lat is not None and destino.lon is not None and destino.lat is not None:
                    ruta_data = await obtener_ruta_osrm(
                        float(origen.lon), float(origen.lat),
                        float(destino.lon), float(destino.lat)
                    )
                
                # Crear viaje automáticamente con ruta completa
                nuevo_viaje = models.Viaje(
                    transportista_id=transportista_id,
                    orden_id=orden.id,
                    origen_id=orden.origen_id,
                    destino_id=orden.destino_id,
                    ubicacion_actual_lat=transportista.ubicacion_actual_lat if transportista else (origen.lat if origen else None),
                    ubicacion_actual_lon=transportista.ubicacion_actual_lon if transportista else (origen.lon if origen else None),
                    distancia_total_km=ruta_data["distance"] if ruta_data else orden.distancia_km,
                    distancia_recorrida_km=0,
                    tiempo_estimado_minutos=ruta_data["duration"] if ruta_data else (int(float(orden.distancia_km) * 1.5) if orden.distancia_km else 60),
                    tiempo_transcurrido_minutos=0,
                    estado="en_progreso",
                    fecha_inicio=datetime.now(),
                    detenido_minutos=0,
                    ruta_completa=json.dumps(ruta_data["coordinates"]) if ruta_data else None
                )
                db.add(nuevo_viaje)
                
                # Actualizar disponibilidad del transportista
                if transportista:
                    transportista.disponible = False
    
    db.commit()
    
    return {"message": "Estado actualizado", "estado": orden.estado}

# ============== VIAJES ENDPOINTS ==============

@app.get("/api/viajes", response_model=List[schemas.ViajeDetalle])
def listar_viajes(
    proveedor_id: Optional[int] = None,
    transportista_id: Optional[int] = None,
    estado: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Listar viajes activos"""
    query = db.query(models.Viaje)
    
    if transportista_id:
        query = query.filter(models.Viaje.transportista_id == transportista_id)
    if estado:
        query = query.filter(models.Viaje.estado == estado)
    
    viajes = query.all()
    resultado = []
    
    for viaje in viajes:
        orden = db.query(models.OrdenCarga).filter(
            models.OrdenCarga.id == viaje.orden_id
        ).first()
        
        if proveedor_id and orden and orden.proveedor_id != proveedor_id:
            continue
        
        transportista = db.query(models.Transportista).filter(
            models.Transportista.id == viaje.transportista_id
        ).first()
        
        origen = db.query(models.Origen).filter(
            models.Origen.id == viaje.origen_id
        ).first()
        
        destino = db.query(models.Origen).filter(
            models.Origen.id == viaje.destino_id
        ).first()
        
        ruta_completa = None
        if viaje.ruta_completa:
            try:
                ruta_completa = json.loads(viaje.ruta_completa)
            except:
                pass
        
        resultado.append({
            "id": viaje.id,
            "transportista_id": viaje.transportista_id,
            "orden_id": viaje.orden_id,
            "proveedor_id": orden.proveedor_id if orden else None,
            "origen": origen.nombre if origen else "Origen",
            "destino": destino.nombre if destino else "Destino",
            "origen_lat": float(origen.lat) if origen and origen.lat else 40.4168,
            "origen_lon": float(origen.lon) if origen and origen.lon else -3.7038,
            "destino_lat": float(destino.lat) if destino and destino.lat else 41.3851,
            "destino_lon": float(destino.lon) if destino and destino.lon else 2.1734,
            "ubicacion_actual_lat": float(viaje.ubicacion_actual_lat) if viaje.ubicacion_actual_lat else (float(origen.lat) if origen and origen.lat else 40.4168),
            "ubicacion_actual_lon": float(viaje.ubicacion_actual_lon) if viaje.ubicacion_actual_lon else (float(origen.lon) if origen and origen.lon else -3.7038),
            "distancia_total_km": float(viaje.distancia_total_km) if viaje.distancia_total_km else 0,
            "distancia_recorrida_km": float(viaje.distancia_recorrida_km) if viaje.distancia_recorrida_km else 0,
            "tiempo_estimado_minutos": viaje.tiempo_estimado_minutos if viaje.tiempo_estimado_minutos else 0,
            "tiempo_transcurrido_minutos": viaje.tiempo_transcurrido_minutos if viaje.tiempo_transcurrido_minutos else 0,
            "estado": viaje.estado,
            "fecha_inicio": viaje.fecha_inicio.isoformat() if viaje.fecha_inicio else None,
            "fecha_fin": viaje.fecha_fin.isoformat() if viaje.fecha_fin else None,
            "ultima_actualizacion": viaje.ultima_actualizacion.isoformat() if viaje.ultima_actualizacion else None,
            "detenido_minutos": viaje.detenido_minutos if viaje.detenido_minutos else 0,
            "ruta_completa": ruta_completa
        })
    
    return resultado

@app.put("/api/viajes/{viaje_id}/estado")
def actualizar_estado_viaje(
    viaje_id: int,
    estado: schemas.EstadoViajeUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar estado del viaje (entregado/finalizado)"""
    viaje = db.query(models.Viaje).filter(models.Viaje.id == viaje_id).first()
    
    if not viaje:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    
    estados_validos = ["en_progreso", "entregado", "finalizado", "completado", "cancelado"]
    if estado.estado not in estados_validos:
        raise HTTPException(
            status_code=400, 
            detail=f"Estado inválido. Debe ser uno de: {', '.join(estados_validos)}"
        )
    
    estado_anterior = viaje.estado
    viaje.estado = estado.estado
    
    # Si se marca como entregado o finalizado, registrar fecha de fin
    if estado.estado in ["entregado", "finalizado", "completado"]:
        viaje.fecha_fin = datetime.now()
        
        # Calcular tiempo total transcurrido
        if viaje.fecha_inicio:
            tiempo_total = (datetime.now() - viaje.fecha_inicio).total_seconds() / 60
            viaje.tiempo_transcurrido_minutos = int(tiempo_total)
    
    # Si se finaliza el viaje, actualizar estadísticas
    if estado.estado == "finalizado" and estado_anterior != "finalizado":
        # Actualizar la orden relacionada
        if viaje.orden_id:
            orden = db.query(models.OrdenCarga).filter(
                models.OrdenCarga.id == viaje.orden_id
            ).first()
            if orden:
                orden.estado = "completada"
                orden.completada_en = datetime.now()
        
        # Actualizar estadísticas del transportista
        transportista = db.query(models.Transportista).filter(
            models.Transportista.id == viaje.transportista_id
        ).first()
        if transportista:
            transportista.viajes_completados += 1
            transportista.disponible = True  # El transportista vuelve a estar disponible
            
        # Crear notificación al proveedor
        if viaje.orden_id:
            orden = db.query(models.OrdenCarga).filter(
                models.OrdenCarga.id == viaje.orden_id
            ).first()
            if orden:
                proveedor = db.query(models.Proveedor).filter(
                    models.Proveedor.id == orden.proveedor_id
                ).first()
                if proveedor:
                    nueva_notificacion = models.Notificacion(
                        usuario_id=proveedor.usuario_id,
                        evento=f"Viaje #{viaje.id} finalizado",
                        payload_json=f'{{"viaje_id": {viaje.id}, "orden_id": {viaje.orden_id}, "tipo": "viaje_finalizado"}}',
                        leida=False
                    )
                    db.add(nueva_notificacion)
    
    # Notificar al proveedor cuando se entrega
    if estado.estado == "entregado" and estado_anterior != "entregado":
        if viaje.orden_id:
            orden = db.query(models.OrdenCarga).filter(
                models.OrdenCarga.id == viaje.orden_id
            ).first()
            if orden:
                proveedor = db.query(models.Proveedor).filter(
                    models.Proveedor.id == orden.proveedor_id
                ).first()
                if proveedor:
                    nueva_notificacion = models.Notificacion(
                        usuario_id=proveedor.usuario_id,
                        evento=f"Paquete entregado - Viaje #{viaje.id}",
                        payload_json=f'{{"viaje_id": {viaje.id}, "orden_id": {viaje.orden_id}, "tipo": "paquete_entregado"}}',
                        leida=False
                    )
                    db.add(nueva_notificacion)
    
    try:
        db.commit()
        db.refresh(viaje)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error actualizando viaje: {str(e)}")
    
    return {"message": "Estado del viaje actualizado", "estado": viaje.estado}


# ============== NOTIFICACIONES ENDPOINTS ==============

@app.get("/api/notificaciones/{usuario_id}", response_model=List[schemas.NotificacionDetalle])
def listar_notificaciones(usuario_id: int, db: Session = Depends(get_db)):
    """Listar notificaciones de un usuario"""
    notificaciones = db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id == usuario_id
    ).order_by(models.Notificacion.ts_envio.desc()).limit(50).all()
    
    return notificaciones


@app.put("/api/notificaciones/{notificacion_id}/leer")
def marcar_notificacion_leida(notificacion_id: int, db: Session = Depends(get_db)):
    """Marcar notificación como leída"""
    notificacion = db.query(models.Notificacion).filter(
        models.Notificacion.id == notificacion_id
    ).first()
    
    if not notificacion:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    notificacion.leida = True
    db.commit()
    
    return {"message": "Notificación marcada como leída"}


# ============== CONFIGURACIÓN ENDPOINTS ==============

@app.get("/api/config/tipos-camion")
def listar_tipos_camion(db: Session = Depends(get_db)):
    """Listar tipos de camión disponibles"""
    tipos = db.query(models.TipoCamion).all()
    return tipos


@app.get("/api/config/tipos-carga")
def listar_tipos_carga(db: Session = Depends(get_db)):
    """Listar tipos de carga disponibles"""
    tipos = db.query(models.TipoCarga).all()
    return tipos


# ============== ADMIN ENDPOINTS ==============

@app.get("/api/admin/estadisticas", response_model=schemas.EstadisticasAdmin)
def obtener_estadisticas_admin(db: Session = Depends(get_db)):
    """Obtener estadísticas completas del sistema"""
    
    total_usuarios = db.query(models.Usuario).count()
    total_proveedores = db.query(models.Proveedor).count()
    total_transportistas = db.query(models.Transportista).count()
    total_ordenes = db.query(models.OrdenCarga).count()
    ordenes_completadas = db.query(models.OrdenCarga).filter(
        models.OrdenCarga.estado == "completada"
    ).count()
    ordenes_en_progreso = db.query(models.OrdenCarga).filter(
        models.OrdenCarga.estado.in_(["aceptada", "en_progreso"])
    ).count()
    
    # Calcular CO2 total emitido
    co2_emitido = db.query(func.sum(models.Transportista.emisiones_co2_total)).scalar() or 0
    
    # Calcular CO2 total ahorrado
    co2_ahorrado_transportistas = db.query(func.sum(models.Transportista.co2_ahorrado)).scalar() or 0
    co2_ahorrado_ordenes = db.query(func.sum(models.OrdenCarga.co2_ahorrado)).scalar() or 0
    co2_total_ahorrado = float(co2_ahorrado_transportistas) + float(co2_ahorrado_ordenes)
    
    viajes_completados = db.query(func.sum(models.Transportista.viajes_completados)).scalar() or 0
    
    # Calcular ingresos totales
    ingresos_totales = db.query(func.sum(models.OrdenCarga.precio)).filter(
        models.OrdenCarga.estado == "completada"
    ).scalar() or 0
    
    # Calcular reputación promedio
    reputacion_promedio = db.query(func.avg(models.Transportista.reputacion)).scalar() or 0
    
    return {
        "total_usuarios": total_usuarios,
        "total_proveedores": total_proveedores,
        "total_transportistas": total_transportistas,
        "total_ordenes": total_ordenes,
        "ordenes_completadas": ordenes_completadas,
        "ordenes_en_progreso": ordenes_en_progreso,
        "co2_total_emitido": float(co2_emitido),
        "co2_total_ahorrado": co2_total_ahorrado,
        "viajes_completados": viajes_completados,
        "ingresos_totales": float(ingresos_totales),
        "reputacion_promedio": float(reputacion_promedio)
    }

@app.get("/api/admin/usuarios", response_model=List[schemas.UsuarioAdmin])
def listar_usuarios_admin(
    rol: Optional[str] = None,
    estado: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Listar todos los usuarios del sistema"""
    query = db.query(models.Usuario)
    
    if rol:
        query = query.filter(models.Usuario.rol_global == rol)
    if estado:
        query = query.filter(models.Usuario.estado == estado)
    
    usuarios = query.all()
    return usuarios

@app.put("/api/admin/usuarios/{usuario_id}")
def actualizar_usuario_admin(
    usuario_id: int,
    datos: schemas.UsuarioUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar datos de un usuario"""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if datos.estado:
        usuario.estado = datos.estado
    if datos.email:
        usuario.email = datos.email
    
    db.commit()
    return {"message": "Usuario actualizado correctamente"}

@app.delete("/api/admin/usuarios/{usuario_id}")
def eliminar_usuario_admin(usuario_id: int, db: Session = Depends(get_db)):
    """Dar de baja (soft delete) a un usuario"""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    usuario.estado = "inactivo"
    db.commit()
    
    return {"message": "Usuario dado de baja correctamente"}

@app.get("/api/admin/actividad-reciente", response_model=List[schemas.ActividadReciente])
def obtener_actividad_reciente(db: Session = Depends(get_db)):
    """Obtener actividad reciente del sistema"""
    actividades = []
    
    # Órdenes recientes
    ordenes_recientes = db.query(models.OrdenCarga).order_by(
        models.OrdenCarga.creada_en.desc()
    ).limit(10).all()
    
    for orden in ordenes_recientes:
        actividades.append({
            "tipo": "orden",
            "descripcion": f"Nueva orden de carga #{orden.id}",
            "fecha": orden.creada_en,
            "usuario_id": orden.proveedor_id
        })
    
    # Usuarios recientes
    usuarios_recientes = db.query(models.Usuario).order_by(
        models.Usuario.creado_en.desc()
    ).limit(10).all()
    
    for usuario in usuarios_recientes:
        actividades.append({
            "tipo": "usuario",
            "descripcion": f"Nuevo usuario registrado: {usuario.email}",
            "fecha": usuario.creado_en,
            "usuario_id": usuario.id
        })
    
    # Ordenar por fecha
    actividades.sort(key=lambda x: x["fecha"], reverse=True)
    
    return actividades[:20]

# ============== CALIFICACIONES ENDPOINTS ==============

@app.post("/api/calificaciones", response_model=schemas.CalificacionDetalle)
def crear_calificacion(calificacion: schemas.CalificacionCreate, db: Session = Depends(get_db)):
    """Crear nueva calificación para un transportista"""
    
    # Verificar que la orden existe y está completada
    orden = db.query(models.OrdenCarga).filter(
        models.OrdenCarga.id == calificacion.orden_id
    ).first()
    
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    if orden.estado != "completada":
        raise HTTPException(status_code=400, detail="Solo se pueden calificar órdenes completadas")
    
    # Verificar que no existe ya una calificación para esta orden
    calificacion_existente = db.query(models.Calificacion).filter(
        models.Calificacion.orden_id == calificacion.orden_id
    ).first()
    
    if calificacion_existente:
        raise HTTPException(status_code=400, detail="Esta orden ya ha sido calificada")
    
    # Crear la calificación
    nueva_calificacion = models.Calificacion(
        orden_id=calificacion.orden_id,
        transportista_id=calificacion.transportista_id,
        proveedor_id=calificacion.proveedor_id,
        puntuacion=calificacion.puntuacion,
        comentario=calificacion.comentario,
        puntualidad=calificacion.puntualidad,
        cuidado_carga=calificacion.cuidado_carga,
        comunicacion=calificacion.comunicacion
    )
    
    db.add(nueva_calificacion)
    
    # Actualizar la reputación del transportista
    transportista = db.query(models.Transportista).filter(
        models.Transportista.id == calificacion.transportista_id
    ).first()
    
    if transportista:
        # Calcular nuevo promedio
        total_calificaciones = transportista.cantidad_calificaciones
        reputacion_actual = float(transportista.reputacion)
        nueva_reputacion = (reputacion_actual * total_calificaciones + calificacion.puntuacion) / (total_calificaciones + 1)
        
        transportista.reputacion = nueva_reputacion
        transportista.cantidad_calificaciones += 1
    
    db.commit()
    db.refresh(nueva_calificacion)
    
    return nueva_calificacion

@app.get("/api/calificaciones/transportista/{transportista_id}", response_model=List[schemas.CalificacionDetalle])
def obtener_calificaciones_transportista(transportista_id: int, db: Session = Depends(get_db)):
    """Obtener todas las calificaciones de un transportista"""
    calificaciones = db.query(models.Calificacion).filter(
        models.Calificacion.transportista_id == transportista_id
    ).order_by(models.Calificacion.creada_en.desc()).all()
    
    return calificaciones

async def obtener_ruta_osrm(origen_lon: float, origen_lat: float, destino_lon: float, destino_lat: float):
    """Obtener ruta completa usando OSRM con coordenadas precisas"""
    url = f"http://router.project-osrm.org/route/v1/driving/{origen_lon},{origen_lat};{destino_lon},{destino_lat}?overview=full&geometries=geojson"
    
    try:
        # Aumentar timeout a 30 segundos para solicitudes a OSRM
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status() # Lanza una excepción para códigos de estado de error HTTP
            data = response.json()
            
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                coordinates = route["geometry"]["coordinates"]
                # Convertir de [lon, lat] a {"lat": lat, "lng": lon}
                coords_formatted = [{"lat": coord[1], "lng": coord[0]} for coord in coordinates]
                distance_km = round(route["distance"] / 1000, 2)
                duration_min = round(route["duration"] / 60)
                
                return {
                    "coordinates": coords_formatted,
                    "distance": distance_km,
                    "duration": duration_min
                }
    except httpx.HTTPStatusError as e:
        print(f"[v0] Error HTTP obteniendo ruta OSRM: {e.response.status_code} - {e.response.text}")
    except httpx.RequestError as e:
        print(f"[v0] Error de solicitud al obtener ruta OSRM: {e}")
    except Exception as e:
        print(f"[v0] Error inesperado obteniendo ruta OSRM: {e}")
    
    # Fallback: línea recta
    return {
        "coordinates": [
            {"lat": origen_lat, "lng": origen_lon},
            {"lat": destino_lat, "lng": destino_lon}
        ],
        "distance": 0,
        "duration": 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
