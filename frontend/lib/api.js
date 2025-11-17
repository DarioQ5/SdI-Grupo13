
const API_BASE_URL = "http://localhost:8000";


class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Error en la petición");
      }
      
      return await response.json();
    } catch (error) {
      console.error(`[v0] API Error en ${endpoint}:`, error);
      throw error;
    }
  }

  // ============== AUTH ==============
  
  async login(email, password) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async registroProveedor(datos) {
    return this.request("/api/auth/registro/proveedor", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  }

  async registroTransportista(datos) {
    return this.request("/api/auth/registro/transportista", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  }

  // ============== TRANSPORTISTAS ==============
  
  async getTransportistas(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.disponible !== undefined) params.append("disponible", filtros.disponible);
    if (filtros.tipo_camion) params.append("tipo_camion", filtros.tipo_camion);
    if (filtros.reefer !== undefined) params.append("reefer", filtros.reefer);
    
    const query = params.toString();
    return this.request(`/api/transportistas${query ? `?${query}` : ""}`);
  }

  async getPerfilTransportista(transportistaId) {
    return this.request(`/api/transportistas/${transportistaId}/perfil`);
  }

  async updateDisponibilidad(transportistaId, disponible) {
    return this.request(`/api/transportistas/${transportistaId}/disponibilidad`, {
      method: "PUT",
      body: JSON.stringify({ disponible }),
    });
  }

  async updateUbicacionTransportista(transportistaId, lat, lon) {
    return this.request(`/api/transportistas/${transportistaId}/ubicacion`, {
      method: "PUT",
      body: JSON.stringify({
        ubicacion_actual_lat: lat,
        ubicacion_actual_lon: lon
      }),
    });
  }

  async getEstadisticasTransportista(transportistaId) {
    return this.request(`/api/transportistas/${transportistaId}/estadisticas`);
  }

  // ============== ORDENES ==============
  
  async getOrdenes(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.proveedor_id) params.append("proveedor_id", filtros.proveedor_id);
    if (filtros.transportista_id) params.append("transportista_id", filtros.transportista_id);
    if (filtros.estado) params.append("estado", filtros.estado);
    
    const query = params.toString();
    return this.request(`/api/ordenes${query ? `?${query}` : ""}`);
  }

  async crearOrden(ordenData) {
    return this.request("/api/ordenes", {
      method: "POST",
      body: JSON.stringify(ordenData),
    });
  }

  async updateEstadoOrden(ordenId, estado, transportistaId = null) {
    const body = { estado };
    if (transportistaId) {
      body.transportista_id = transportistaId;
    }
    return this.request(`/api/ordenes/${ordenId}/estado`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  // ============== VIAJES ==============
  
  async getViajes(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.proveedor_id) params.append("proveedor_id", filtros.proveedor_id);
    if (filtros.transportista_id) params.append("transportista_id", filtros.transportista_id);
    if (filtros.estado) params.append("estado", filtros.estado);
    
    const query = params.toString();
    return this.request(`/api/viajes${query ? `?${query}` : ""}`);
  }

  async updateEstadoViaje(viajeId, estado) {
    return this.request(`/api/viajes/${viajeId}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    });
  }

  // ============== NOTIFICACIONES ==============
  
  async getNotificaciones(usuarioId) {
    return this.request(`/api/notificaciones/${usuarioId}`);
  }

  async marcarNotificacionLeida(notificacionId) {
    return this.request(`/api/notificaciones/${notificacionId}/leer`, {
      method: "PUT",
    });
  }

  // ============== CONFIG ==============
  
  async getTiposCamion() {
    return this.request("/api/config/tipos-camion");
  }

  async getTiposCarga() {
    return this.request("/api/config/tipos-carga");
  }

  // ============== ADMIN ==============
  
  async adminLogin(email, password) {
    return this.request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }
  


  async getEstadisticasAdmin() {
    return this.request("/api/admin/estadisticas");
  }

  async getUsuariosAdmin(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.rol) params.append("rol", filtros.rol);
    if (filtros.estado) params.append("estado", filtros.estado);
    
    const query = params.toString();
    return this.request(`/api/admin/usuarios${query ? `?${query}` : ""}`);
  }

  async updateUsuarioAdmin(usuarioId, datos) {
    return this.request(`/api/admin/usuarios/${usuarioId}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
  }

  async eliminarUsuarioAdmin(usuarioId) {
    return this.request(`/api/admin/usuarios/${usuarioId}`, {
      method: "DELETE",
    });
  }

  async getActividadReciente() {
    return this.request("/api/admin/actividad-reciente");
  }

  // ============== CALIFICACIONES ==============
  
  async crearCalificacion(calificacionData) {
    return this.request("/api/calificaciones", {
      method: "POST",
      body: JSON.stringify(calificacionData),
    });
  }

  async getCalificacionesTransportista(transportistaId) {
    return this.request(`/api/calificaciones/transportista/${transportistaId}`);
  }
}

export const apiClient = new ApiClient();
