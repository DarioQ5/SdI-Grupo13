/**
 * Servicio de routing usando OSRM (Open Source Routing Machine)
 * Completamente gratuito y sin necesidad de API keys
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org';

/**
 * Obtiene la ruta real por carretera entre dos puntos
 * @param {number} lat1 - Latitud de origen
 * @param {number} lon1 - Longitud de origen
 * @param {number} lat2 - Latitud de destino
 * @param {number} lon2 - Longitud de destino
 * @returns {Promise<{coordinates: Array<{lat: number, lng: number}>, distance: number, duration: number}>}
 */
export async function obtenerRutaReal(lat1, lon1, lat2, lon2) {
  try {
    // OSRM espera coordenadas en formato: lon,lat (no lat,lon!)
    const url = `${OSRM_BASE_URL}/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('[v0] Error en OSRM routing:', response.status);
      // Fallback a línea recta si falla
      return generarRutaLineaRecta(lat1, lon1, lat2, lon2);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('[v0] No se encontró ruta:', data.code);
      return generarRutaLineaRecta(lat1, lon1, lat2, lon2);
    }
    
    const route = data.routes[0];
    
    // Convertir coordenadas GeoJSON [lon, lat] a {lat, lng}
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => ({
      lat,
      lng
    }));
    
    return {
      coordinates,
      distance: route.distance / 1000, // Convertir metros a kilómetros
      duration: route.duration / 60 // Convertir segundos a minutos
    };
  } catch (error) {
    console.error('[v0] Error obteniendo ruta:', error);
    // Fallback a línea recta en caso de error
    return generarRutaLineaRecta(lat1, lon1, lat2, lon2);
  }
}

/**
 * Genera una ruta en línea recta como fallback
 * @param {number} lat1 - Latitud de origen
 * @param {number} lon1 - Longitud de origen
 * @param {number} lat2 - Latitud de destino
 * @param {number} lon2 - Longitud de destino
 * @returns {Object} Ruta interpolada
 */
function generarRutaLineaRecta(lat1, lon1, lat2, lon2, puntos = 20) {
  const coordinates = [];
  for (let i = 0; i <= puntos; i++) {
    const t = i / puntos;
    coordinates.push({
      lat: lat1 + (lat2 - lat1) * t,
      lng: lon1 + (lon2 - lon1) * t
    });
  }
  
  // Calcular distancia aproximada usando fórmula de Haversine
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return {
    coordinates,
    distance,
    duration: distance * 1.2 // Estimación: 1.2 minutos por km
  };
}

/**
 * Obtiene múltiples rutas en paralelo
 * @param {Array<{lat1, lon1, lat2, lon2}>} routes - Array de rutas a calcular
 * @returns {Promise<Array>} Array de rutas calculadas
 */
export async function obtenerRutasMultiples(routes) {
  return Promise.all(
    routes.map(({ lat1, lon1, lat2, lon2 }) => 
      obtenerRutaReal(lat1, lon1, lat2, lon2)
    )
  );
}
