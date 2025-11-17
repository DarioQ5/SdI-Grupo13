"""Script para poblar la base de datos con datos iniciales"""
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
from datetime import datetime, timedelta
import random
from decimal import Decimal
import json
import asyncio
import httpx

async def obtener_ruta_osrm_async(origen_lon, origen_lat, destino_lon, destino_lat):
    """Obtener ruta real usando OSRM de forma asíncrona"""
    url = f"http://router.project-osrm.org/route/v1/driving/{origen_lon},{origen_lat};{destino_lon},{destino_lat}?overview=full&geometries=geojson"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            data = response.json()
            
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                coordinates = route["geometry"]["coordinates"]
                coords_formatted = [{"lat": coord[1], "lng": coord[0]} for coord in coordinates]
                distance_km = round(route["distance"] / 1000, 2)
                duration_min = round(route["duration"] / 60)
                
                return {
                    "coordinates": coords_formatted,
                    "distance": distance_km,
                    "duration": duration_min
                }
    except Exception as e:
        print(f"[Seed] Error obteniendo ruta OSRM: {e}")
    
    # Fallback: línea recta con puntos interpolados
    num_puntos = 20
    ruta_coords = []
    for j in range(num_puntos + 1):
        factor = j / num_puntos
        lat_punto = origen_lat + (destino_lat - origen_lat) * factor
        lon_punto = origen_lon + (destino_lon - origen_lon) * factor
        ruta_coords.append({"lat": round(lat_punto, 6), "lng": round(lon_punto, 6)})
    
    # Calcular distancia aproximada
    import math
    R = 6371
    dlat = math.radians(destino_lat - origen_lat)
    dlon = math.radians(destino_lon - origen_lon)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(origen_lat)) * math.cos(math.radians(destino_lat)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distancia_km = R * c
    
    return {
        "coordinates": ruta_coords,
        "distance": round(distancia_km, 2),
        "duration": int(distancia_km * 1.2)
    }

async def seed_database_async():
    """Poblar base de datos con datos de ejemplo usando OSRM"""
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Limpiar tablas existentes
        db.query(models.Calificacion).delete()
        db.query(models.Notificacion).delete()
        db.query(models.Viaje).delete()
        db.query(models.OrdenCarga).delete()
        db.query(models.Camion).delete()
        db.query(models.Transportista).delete()
        db.query(models.Proveedor).delete()
        db.query(models.Administrador).delete()
        db.query(models.Usuario).delete()
        db.query(models.TipoCarga).delete()
        db.query(models.TipoCamion).delete()
        db.query(models.Origen).delete()
        db.commit()
        
        print("✨ Creando administrador...")
        admin_usuario = models.Usuario(
            email="admin@logistica.com",
            hash="admin123",
            rol_global="admin"
        )
        db.add(admin_usuario)
        db.flush()
        
        admin = models.Administrador(
            usuario_id=admin_usuario.id,
            nombre_completo="Administrador Principal",
            telefono="+34 900 000 000",
            permisos="todos"
        )
        db.add(admin)
        db.commit()
        
        print("🚛 Creando tipos de camión...")
        tipos_camion = [
            models.TipoCamion(nombre="Camión Rígido", ejes=2, largo_m=Decimal("7.5"), alto_m=Decimal("3.5")),
            models.TipoCamion(nombre="Tractocamión", ejes=3, largo_m=Decimal("16.5"), alto_m=Decimal("4.0")),
            models.TipoCamion(nombre="Trailer", ejes=4, largo_m=Decimal("13.6"), alto_m=Decimal("4.0")),
            models.TipoCamion(nombre="Mega Trailer", ejes=5, largo_m=Decimal("16.5"), alto_m=Decimal("4.5")),
        ]
        db.add_all(tipos_camion)
        db.commit()
        
        print("📦 Creando tipos de carga...")
        tipos_carga = [
            models.TipoCarga(nombre="Productos Congelados", requiere_reefer=True),
            models.TipoCarga(nombre="Productos Refrigerados", requiere_reefer=True),
            models.TipoCarga(nombre="Carga Seca", requiere_reefer=False),
            models.TipoCarga(nombre="Materiales Peligrosos", requiere_reefer=False, adr_clase="UN1234"),
            models.TipoCarga(nombre="Alimentos Frescos", requiere_reefer=True),
        ]
        db.add_all(tipos_carga)
        db.commit()
        
        print("📍 Creando ubicaciones con coordenadas precisas...")
        ubicaciones = [
            models.Origen(nombre="Madrid", tipo="ciudad", lat=Decimal("40.4168"), lon=Decimal("-3.7038"), provincia="Madrid"),
            models.Origen(nombre="Barcelona", tipo="ciudad", lat=Decimal("41.3851"), lon=Decimal("2.1734"), provincia="Barcelona"),
            models.Origen(nombre="Valencia", tipo="ciudad", lat=Decimal("39.4699"), lon=Decimal("-0.3763"), provincia="Valencia"),
            models.Origen(nombre="Sevilla", tipo="ciudad", lat=Decimal("37.3891"), lon=Decimal("-5.9845"), provincia="Sevilla"),
            models.Origen(nombre="Bilbao", tipo="ciudad", lat=Decimal("43.2627"), lon=Decimal("-2.9253"), provincia="Vizcaya"),
            models.Origen(nombre="Zaragoza", tipo="ciudad", lat=Decimal("41.6488"), lon=Decimal("-0.8891"), provincia="Zaragoza"),
            models.Origen(nombre="Lisboa", tipo="ciudad", lat=Decimal("38.7223"), lon=Decimal("-9.1393"), provincia="Lisboa"),
            models.Origen(nombre="Porto", tipo="ciudad", lat=Decimal("41.1579"), lon=Decimal("-8.6291"), provincia="Porto"),
        ]
        db.add_all(ubicaciones)
        db.commit()
        
        print("👤 Creando usuarios proveedores...")
        proveedores_data = [
            {"email": "proveedor1@logistica.com", "razon_social": "Distribuciones del Norte S.A.", "cuit": "30-12345678-9"},
            {"email": "proveedor2@logistica.com", "razon_social": "Transportes Mediterráneo", "cuit": "30-98765432-1"},
        ]
        
        for p_data in proveedores_data:
            usuario = models.Usuario(
                email=p_data["email"],
                hash="password123",
                rol_global="proveedor"
            )
            db.add(usuario)
            db.flush()
            
            proveedor = models.Proveedor(
                usuario_id=usuario.id,
                razon_social=p_data["razon_social"],
                cuit=p_data["cuit"],
                telefono="+34 600 000 000"
            )
            db.add(proveedor)
        
        db.commit()
        
        print("🚚 Creando transportistas y camiones...")
        transportistas_data = [
            {"email": "trans1@logistica.com", "cuil": "20-11111111-1", "tipo_camion": "Camión Rígido", "capacidad": 12000, "reefer": True, "lat": 40.45, "lon": -3.68, "combustible": "Diesel"},
            {"email": "trans2@logistica.com", "cuil": "20-22222222-2", "tipo_camion": "Tractocamión", "capacidad": 24000, "reefer": False, "lat": 41.40, "lon": 2.15, "combustible": "GNC"},
            {"email": "trans3@logistica.com", "cuil": "20-33333333-3", "tipo_camion": "Trailer", "capacidad": 18000, "reefer": True, "lat": 39.50, "lon": -0.40, "combustible": "Diesel"},
            {"email": "trans4@logistica.com", "cuil": "20-44444444-4", "tipo_camion": "Mega Trailer", "capacidad": 28000, "reefer": False, "lat": 37.40, "lon": -5.98, "combustible": "Diesel"},
            {"email": "trans5@logistica.com", "cuil": "20-55555555-5", "tipo_camion": "Camión Rígido", "capacidad": 10000, "reefer": False, "lat": 43.27, "lon": -2.93, "combustible": "Eléctrico"},
        ]
        
        for i, t_data in enumerate(transportistas_data, 1):
            usuario = models.Usuario(
                email=t_data["email"],
                hash="password123",
                rol_global="transportista"
            )
            db.add(usuario)
            db.flush()
            
            transportista = models.Transportista(
                usuario_id=usuario.id,
                cuil_cuit=t_data["cuil"],
                telefono=f"+34 600 {i:06d}",
                disponible=random.choice([True, False]),
                ubicacion_actual_lat=Decimal(str(t_data["lat"])),
                ubicacion_actual_lon=Decimal(str(t_data["lon"])),
                viajes_completados=random.randint(10, 150),
                reputacion=Decimal(str(round(random.uniform(3.5, 5.0), 2))),
                cantidad_calificaciones=random.randint(5, 50),
                emisiones_co2_total=Decimal(str(random.randint(5000, 50000))),
                co2_ahorrado=Decimal(str(random.randint(2000, 15000)))
            )
            db.add(transportista)
            db.flush()
            
            tipo_camion = db.query(models.TipoCamion).filter_by(nombre=t_data["tipo_camion"]).first()
            
            camion = models.Camion(
                transportista_id=transportista.id,
                patente=f"ABC{i:04d}",
                tipo_camion_id=tipo_camion.id,
                capacidad_kg=Decimal(str(t_data["capacidad"])),
                volumen_m3=Decimal(str(round(t_data["capacidad"] / 200, 2))),
                reefer=t_data["reefer"],
                adr=random.choice([True, False]),
                combustible=t_data["combustible"]
            )
            db.add(camion)
        
        db.commit()
        
        print("📋 Creando órdenes de carga...")
        proveedores = db.query(models.Proveedor).all()
        transportistas = db.query(models.Transportista).all()
        origenes = db.query(models.Origen).all()
        tipos_carga = db.query(models.TipoCarga).all()
        
        ordenes_creadas = []
        for i in range(15):
            proveedor = random.choice(proveedores)
            origen = random.choice(origenes)
            destino = random.choice([o for o in origenes if o.id != origen.id])
            tipo_carga = random.choice(tipos_carga)
            transportista = random.choice(transportistas) if random.random() > 0.3 else None
            
            estado = random.choice(["publicada", "aceptada", "en_progreso", "entregada", "finalizada"])
            
            import math
            R = 6371
            lat1, lon1 = float(origen.lat), float(origen.lon)
            lat2, lon2 = float(destino.lat), float(destino.lon)
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            distancia_km = R * c
            
            orden = models.OrdenCarga(
                proveedor_id=proveedor.id,
                tipo_carga_id=tipo_carga.id,
                peso_kg=Decimal(str(random.randint(5000, 20000))),
                volumen_m3=Decimal(str(random.randint(20, 80))),
                origen_id=origen.id,
                destino_id=destino.id,
                ventana_desde=datetime.now() + timedelta(days=random.randint(1, 7)),
                ventana_hasta=datetime.now() + timedelta(days=random.randint(8, 14)),
                req_reefer=tipo_carga.requiere_reefer,
                req_adr=tipo_carga.adr_clase is not None,
                estado=estado,
                precio=Decimal(str(random.randint(500, 2000))),
                distancia_km=Decimal(str(round(distancia_km, 2))),
                co2_estimado=Decimal(str(random.randint(100, 500))),
                co2_ahorrado=Decimal(str(random.randint(50, 300))) if estado == "finalizada" else Decimal("0"),
                transportista_asignado_id=transportista.id if transportista else None,
                completada_en=datetime.now() - timedelta(days=random.randint(1, 30)) if estado == "finalizada" else None
            )
            db.add(orden)
            db.flush()
            ordenes_creadas.append(orden)
        
        db.commit()
        
        print("⭐ Creando calificaciones con estadísticas de cumplimiento...")
        ordenes_finalizadas = [o for o in ordenes_creadas if o.estado == "finalizada" and o.transportista_asignado_id]
        
        for orden in ordenes_finalizadas[:5]:
            cumple = random.choice([True, False])
            calificacion = models.Calificacion(
                orden_id=orden.id,
                transportista_id=orden.transportista_asignado_id,
                proveedor_id=orden.proveedor_id,
                puntuacion=random.randint(4, 5) if cumple else random.randint(2, 3),
                comentario=random.choice([
                    "Excelente servicio, muy puntual",
                    "Buena comunicación durante todo el viaje",
                    "Carga entregada en perfectas condiciones",
                    "Muy profesional, lo recomiendo",
                    "Servicio correcto, sin problemas",
                    "Hubo un pequeño retraso pero avisó con tiempo",
                    "Buen servicio en general"
                ]),
                puntualidad=random.randint(4, 5) if cumple else random.randint(2, 3),
                cuidado_carga=random.randint(4, 5),
                comunicacion=random.randint(3, 5),
                cumple_plazo=cumple,
                tiempo_demora_horas=0 if cumple else random.randint(2, 48)
            )
            db.add(calificacion)
        
        db.commit()
        
        print("🗺️  Creando viajes con diferentes estados usando rutas reales de OSRM...")
        ordenes_con_viaje = [o for o in ordenes_creadas if o.estado in ["aceptada", "en_progreso", "entregada", "finalizada"]]
        
        estados_viaje = {
            "aceptada": "pendiente",
            "en_progreso": "en_progreso",
            "entregada": "entregado",
            "finalizada": "finalizado"
        }
        
        for idx, orden in enumerate(ordenes_con_viaje[:8], 1):
            if orden.transportista_asignado_id:
                print(f"  [{idx}/8] Calculando ruta para viaje {orden.id} (estado: {orden.estado})...")
                
                origen = db.query(models.Origen).get(orden.origen_id)
                destino = db.query(models.Origen).get(orden.destino_id)
                
                # Obtener ruta real usando OSRM
                ruta_data = await obtener_ruta_osrm_async(
                    float(origen.lon), float(origen.lat),
                    float(destino.lon), float(destino.lat)
                )
                
                estado_viaje = estados_viaje.get(orden.estado, "pendiente")
                
                if estado_viaje == "pendiente":
                    progreso = 0.0
                elif estado_viaje == "en_progreso":
                    progreso = random.uniform(0.2, 0.8)
                elif estado_viaje in ["entregado", "finalizado"]:
                    progreso = 1.0
                else:
                    progreso = 0.0
                
                # Calcular posición actual basada en progreso
                if progreso > 0 and ruta_data["coordinates"]:
                    indice_actual = int(progreso * (len(ruta_data["coordinates"]) - 1))
                    if indice_actual >= len(ruta_data["coordinates"]):
                        indice_actual = len(ruta_data["coordinates"]) - 1
                    lat_actual = Decimal(str(ruta_data["coordinates"][indice_actual]["lat"]))
                    lon_actual = Decimal(str(ruta_data["coordinates"][indice_actual]["lng"]))
                else:
                    lat_actual = origen.lat
                    lon_actual = origen.lon
                
                # Actualizar ubicación del transportista
                transportista = db.query(models.Transportista).get(orden.transportista_asignado_id)
                if transportista and estado_viaje == "en_progreso":
                    transportista.ubicacion_actual_lat = lat_actual
                    transportista.ubicacion_actual_lon = lon_actual
                
                tiempo_estimado_horas = ruta_data["duration"] / 60
                fecha_inicio = datetime.now() - timedelta(hours=random.randint(2, 24))
                tiempo_entrega_esperado = fecha_inicio + timedelta(hours=tiempo_estimado_horas)
                
                # Simular demoras en algunos casos
                tiene_demora = random.choice([True, False]) if estado_viaje in ["entregado", "finalizado"] else False
                demora_horas = random.randint(1, 12) if tiene_demora else 0
                tiempo_entrega_real = tiempo_entrega_esperado + timedelta(hours=demora_horas) if estado_viaje in ["entregado", "finalizado"] else None
                
                viaje = models.Viaje(
                    transportista_id=orden.transportista_asignado_id,
                    orden_id=orden.id,
                    origen_id=orden.origen_id,
                    destino_id=orden.destino_id,
                    ubicacion_actual_lat=lat_actual,
                    ubicacion_actual_lon=lon_actual,
                    distancia_total_km=Decimal(str(ruta_data["distance"])),
                    distancia_recorrida_km=Decimal(str(ruta_data["distance"])) * Decimal(str(progreso)),
                    tiempo_estimado_minutos=ruta_data["duration"],
                    tiempo_transcurrido_minutos=int(ruta_data["duration"] * progreso),
                    estado=estado_viaje,
                    fecha_inicio=fecha_inicio,
                    detenido_minutos=random.randint(0, 45) if estado_viaje == "en_progreso" else 0,
                    ruta_completa=json.dumps(ruta_data["coordinates"]),
                    tiempo_entrega_esperado=tiempo_entrega_esperado,
                    tiempo_entrega_real=tiempo_entrega_real,
                    cumple_plazo=not tiene_demora if estado_viaje in ["entregado", "finalizado"] else None
                )
                db.add(viaje)
                
                # Actualizar distancia de la orden con la distancia real
                orden.distancia_km = Decimal(str(ruta_data["distance"]))
        
        db.commit()
        
        print("\n✅ ¡Base de datos poblada exitosamente con rutas reales y nuevos estados!")
        print("\n=== CREDENCIALES DE ACCESO ===")
        print("🔐 Administrador: admin@logistica.com / admin123")
        print("📦 Proveedor 1: proveedor1@logistica.com / password123")
        print("📦 Proveedor 2: proveedor2@logistica.com / password123")
        print("🚛 Transportista 1: trans1@logistica.com / password123")
        print("🚛 Transportista 2: trans2@logistica.com / password123")
        print("🚛 Transportista 3: trans3@logistica.com / password123")
        print("\n💡 Tip: Los viajes incluyen estados 'entregado' pendientes de confirmación")
        print("📊 Calificaciones ahora incluyen estadísticas de cumplimiento de plazos")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

def seed_database():
    """Wrapper síncrono para ejecutar seed_database_async"""
    asyncio.run(seed_database_async())

if __name__ == "__main__":
    seed_database()
