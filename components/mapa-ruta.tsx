"use client"
import { Badge } from "@/components/ui/badge"

interface MapaRutaProps {
  origen: string
  destino: string
  progreso: number
  patente?: string
  className?: string
}

export function MapaRuta({ origen, destino, progreso, patente, className = "" }: MapaRutaProps) {
  // Calcular posición del camión basado en el progreso
  const camionX = 50 + (350 - 50) * (progreso / 100)

  return (
    <div
      className={`relative w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-900 rounded-lg overflow-hidden border ${className}`}
    >
      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
        {/* Fondo con gradiente */}
        <defs>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>

          {/* Sombra para el camión */}
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Carretera base */}
        <rect x="30" y="90" width="340" height="20" fill="url(#roadGradient)" rx="10" opacity="0.3" />

        {/* Línea de ruta principal */}
        <line
          x1="50"
          y1="100"
          x2="350"
          y2="100"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeDasharray="8,4"
          opacity="0.6"
        />

        {/* Línea de progreso completado */}
        <line
          x1="50"
          y1="100"
          x2={camionX}
          y2="100"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Punto de origen con animación */}
        <g>
          <circle cx="50" cy="100" r="12" fill="hsl(var(--secondary))" opacity="0.3">
            <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="100" r="8" fill="hsl(var(--secondary))" />
          <circle cx="50" cy="100" r="4" fill="white" />
        </g>

        {/* Etiqueta origen */}
        <g>
          <rect x="10" y="120" width="80" height="24" fill="white" rx="4" opacity="0.95" />
          <text x="50" y="135" textAnchor="middle" fontSize="11" fontWeight="600" fill="hsl(var(--foreground))">
            {origen.split(",")[0]}
          </text>
        </g>

        {/* Punto de destino con animación */}
        <g>
          <circle cx="350" cy="100" r="12" fill="hsl(var(--destructive))" opacity="0.3">
            <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" begin="1s" />
          </circle>
          <circle cx="350" cy="100" r="8" fill="hsl(var(--destructive))" />
          <circle cx="350" cy="100" r="4" fill="white" />
        </g>

        {/* Etiqueta destino */}
        <g>
          <rect x="310" y="120" width="80" height="24" fill="white" rx="4" opacity="0.95" />
          <text x="350" y="135" textAnchor="middle" fontSize="11" fontWeight="600" fill="hsl(var(--foreground))">
            {destino.split(",")[0]}
          </text>
        </g>

        {/* Camión en posición actual con sombra */}
        <g transform={`translate(${camionX}, 100)`} filter="url(#shadow)">
          {/* Base del camión */}
          <rect x="-16" y="-12" width="32" height="24" fill="hsl(var(--primary))" rx="4" />

          {/* Cabina */}
          <rect x="-16" y="-12" width="12" height="24" fill="hsl(var(--primary))" rx="2" opacity="0.8" />

          {/* Ventanas */}
          <rect x="-14" y="-8" width="8" height="8" fill="white" rx="1" opacity="0.9" />

          {/* Ruedas */}
          <circle cx="-10" cy="12" r="3" fill="hsl(var(--foreground))" />
          <circle cx="8" cy="12" r="3" fill="hsl(var(--foreground))" />

          {/* Icono de camión emoji como respaldo */}
          <text textAnchor="middle" dominantBaseline="middle" fontSize="20" y="-20">
            🚛
          </text>
        </g>

        {/* Marcadores de distancia */}
        {[25, 50, 75].map((percent) => (
          <g key={percent}>
            <line
              x1={50 + (350 - 50) * (percent / 100)}
              y1="105"
              x2={50 + (350 - 50) * (percent / 100)}
              y2="110"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              opacity="0.3"
            />
          </g>
        ))}
      </svg>

      {/* Overlay con información */}
      <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs font-semibold">
            {progreso}% completado
          </Badge>
        </div>
        {patente && (
          <p className="text-xs text-muted-foreground mt-1">
            Patente: <span className="font-medium text-foreground">{patente}</span>
          </p>
        )}
      </div>

      {/* Indicador de movimiento */}
      {progreso < 100 && (
        <div className="absolute top-3 right-3 bg-accent/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">En movimiento</span>
          </div>
        </div>
      )}
    </div>
  )
}
