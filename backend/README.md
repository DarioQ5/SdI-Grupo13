# Backend FastAPI - Plataforma Logística

## Instalación

1. Instalar dependencias:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Configurar PostgreSQL:
\`\`\`bash
# Crear base de datos
createdb logistica_db

# O con docker
docker run --name postgres-logistica -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=logistica_db -p 5432:5432 -d postgres:15
\`\`\`

3. Configurar variable de entorno (opcional):
\`\`\`bash
export DATABASE_URL="postgresql://postgres:postgres@localhost/logistica_db"
\`\`\`

4. Poblar base de datos:
\`\`\`bash
python seed_data.py
\`\`\`

5. Ejecutar servidor:
\`\`\`bash
python main.py
# O con uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

## Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Login para proveedores y transportistas

### Transportistas
- `GET /api/transportistas` - Listar transportistas (con filtros)
- `GET /api/transportistas/{id}/perfil` - Obtener perfil completo
- `PUT /api/transportistas/{id}/disponibilidad` - Actualizar disponibilidad

### Órdenes/Ofertas
- `GET /api/ordenes` - Listar órdenes (con filtros)
- `POST /api/ordenes` - Crear nueva orden
- `PUT /api/ordenes/{id}/estado` - Actualizar estado (aceptar/rechazar)

### Viajes
- `GET /api/viajes` - Listar viajes activos

### Notificaciones
- `GET /api/notificaciones/{usuario_id}` - Listar notificaciones
- `PUT /api/notificaciones/{id}/leer` - Marcar como leída

### Configuración
- `GET /api/config/tipos-camion` - Tipos de camión
- `GET /api/config/tipos-carga` - Tipos de carga

## Documentación API

Una vez ejecutando el servidor, visitar:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Credenciales de Prueba

**Proveedores:**
- Email: proveedor1@logistica.com
- Password: password123

**Transportistas:**
- Email: trans1@logistica.com
- Password: password123
