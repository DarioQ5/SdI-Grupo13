"use client"

interface MapaArgentinaProps {
  transportistas?: Array<{
    id: number
    nombre: string
    lat: number
    lng: number
    destino: { lat: number; lng: number; nombre: string }
    disponible: boolean
  }>
  cargas?: Array<{
    id: number
    origen: { lat: number; lng: number; nombre: string }
    destino: { lat: number; lng: number; nombre: string }
  }>
  highlightTransportista?: number
}

export function MapaArgentina({ transportistas = [], cargas = [], highlightTransportista }: MapaArgentinaProps) {
  // Coordenadas simplificadas de Argentina y países vecinos
  const rutasPrincipales = [
    // Corredor Bioceánico
    { from: { x: 180, y: 280 }, to: { x: 80, y: 250 }, label: "Mendoza-Valparaíso" },
    // Otras rutas importantes
    { from: { x: 280, y: 380 }, to: { x: 180, y: 280 }, label: "Buenos Aires-Mendoza" },
    { from: { x: 280, y: 380 }, to: { x: 180, y: 200 }, label: "Buenos Aires-Santiago" },
  ]

  const ciudades = [
    { x: 280, y: 380, nombre: "Buenos Aires", pais: "AR" },
    { x: 180, y: 280, nombre: "Mendoza", pais: "AR" },
    { x: 240, y: 320, nombre: "Córdoba", pais: "AR" },
    { x: 260, y: 340, nombre: "Rosario", pais: "AR" },
    { x: 80, y: 250, nombre: "Valparaíso", pais: "CL" },
    { x: 100, y: 200, nombre: "Santiago", pais: "CL" },
    { x: 120, y: 100, nombre: "Antofagasta", pais: "CL" },
    { x: 200, y: 50, nombre: "Lima", pais: "PE" },
    { x: 380, y: 280, nombre: "Santos", pais: "BR" },
  ]

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg p-4 border">
      <svg viewBox="0 0 500 500" className="w-full h-auto">
        {/* Fondo del mapa */}
        <rect x="0" y="0" width="500" height="500" fill="transparent" />

        {/* Contorno simplificado de Argentina */}
        <path
          d="M 200 150 L 250 180 L 280 220 L 300 280 L 290 350 L 280 400 L 260 450 L 240 480 L 220 490 L 200 485 L 180 470 L 170 440 L 160 400 L 150 350 L 140 300 L 130 250 L 140 200 L 160 160 L 180 140 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Chile */}
        <path
          d="M 60 100 L 80 150 L 90 200 L 100 250 L 110 300 L 100 320 L 90 310 L 80 280 L 70 240 L 60 200 L 50 150 L 55 120 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Rutas principales */}
        {rutasPrincipales.map((ruta, i) => (
          <g key={i}>
            <line
              x1={ruta.from.x}
              y1={ruta.from.y}
              x2={ruta.to.x}
              y2={ruta.to.y}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.4"
            />
          </g>
        ))}

        {/* Cargas en el mapa */}
        {cargas.map((carga) => (
          <g key={carga.id}>
            <line
              x1={carga.origen.lng * 2}
              y1={carga.origen.lat * 2}
              x2={carga.destino.lng * 2}
              y2={carga.destino.lat * 2}
              stroke="hsl(var(--accent))"
              strokeWidth="3"
              opacity="0.6"
            />
            <circle cx={carga.origen.lng * 2} cy={carga.origen.lat * 2} r="6" fill="hsl(var(--accent))" />
            <circle cx={carga.destino.lng * 2} cy={carga.destino.lat * 2} r="6" fill="hsl(var(--secondary))" />
          </g>
        ))}

        {/* Transportistas en el mapa */}
        {transportistas.map((transportista) => {
          const isHighlighted = highlightTransportista === transportista.id
          return (
            <g key={transportista.id}>
              {/* Línea de ruta del transportista */}
              <line
                x1={transportista.lng * 2}
                y1={transportista.lat * 2}
                x2={transportista.destino.lng * 2}
                y2={transportista.destino.lat * 2}
                stroke={transportista.disponible ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                strokeWidth={isHighlighted ? "3" : "2"}
                strokeDasharray="3,3"
                opacity="0.5"
              />
              {/* Posición actual del transportista */}
              <g transform={`translate(${transportista.lng * 2}, ${transportista.lat * 2})`}>
                <circle
                  r={isHighlighted ? "12" : "8"}
                  fill={transportista.disponible ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  y="4"
                  textAnchor="middle"
                  fontSize="12"
                  fill="white"
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  🚛
                </text>
              </g>
              {/* Destino del transportista */}
              <circle
                cx={transportista.destino.lng * 2}
                cy={transportista.destino.lat * 2}
                r="6"
                fill="hsl(var(--secondary))"
                opacity="0.7"
              />
            </g>
          )
        })}

        {/* Ciudades */}
        {ciudades.map((ciudad, i) => (
          <g key={i}>
            <circle cx={ciudad.x} cy={ciudad.y} r="4" fill="hsl(var(--foreground))" opacity="0.6" />
            <text
              x={ciudad.x}
              y={ciudad.y - 8}
              textAnchor="middle"
              fontSize="10"
              fill="hsl(var(--foreground))"
              fontWeight="500"
              style={{ pointerEvents: "none" }}
            >
              {ciudad.nombre}
            </text>
          </g>
        ))}

        {/* Leyenda */}
        <g transform="translate(10, 450)">
          <rect x="0" y="0" width="180" height="40" fill="hsl(var(--card))" opacity="0.9" rx="4" />
          <circle cx="10" cy="12" r="4" fill="hsl(var(--primary))" />
          <text x="20" y="16" fontSize="10" fill="hsl(var(--foreground))">
            Transportista disponible
          </text>
          <circle cx="10" cy="28" r="4" fill="hsl(var(--accent))" />
          <text x="20" y="32" fontSize="10" fill="hsl(var(--foreground))">
            Carga disponible
          </text>
        </g>
      </svg>
    </div>
  )
}
