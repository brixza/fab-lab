'use client'

export interface RadarDimension {
  label: string
  value: number  // 0-100
}

interface RadarChartProps {
  dimensions: RadarDimension[]
  size?: number
  color?: string
}

export default function RadarChart({
  dimensions,
  size = 260,
  color = '#2c3e50',
}: RadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.34
  const labelRadius = size * 0.46
  const rings = [0.25, 0.5, 0.75, 1]
  const n = dimensions.length

  function polarToXY(index: number, r: number) {
    const angle = (index * (2 * Math.PI)) / n - Math.PI / 2
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    }
  }

  const dataPoints = dimensions.map((d, i) =>
    polarToXY(i, (d.value / 100) * radius)
  )
  const dataPath = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ') + ' Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {rings.map((ring) => {
        const pts = dimensions.map((_, i) => polarToXY(i, ring * radius))
        const path = pts
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
          .join(' ') + ' Z'
        return (
          <path
            key={ring}
            d={path}
            fill="none"
            stroke="#e0ddd8"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const outer = polarToXY(i, radius)
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
            stroke="#e0ddd8"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Data polygon */}
      <path
        d={dataPath}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth={1.5}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}

      {/* Labels */}
      {dimensions.map((d, i) => {
        const pos = polarToXY(i, labelRadius)
        const angle = (i * (2 * Math.PI)) / n - Math.PI / 2
        const anchor =
          Math.abs(Math.cos(angle)) < 0.1 ? 'middle'
          : Math.cos(angle) > 0 ? 'start'
          : 'end'
        return (
          <text
            key={i}
            x={pos.x.toFixed(2)}
            y={pos.y.toFixed(2)}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={9}
            letterSpacing="0.1em"
            fill="#6b6b6b"
            style={{ textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}
          >
            {d.label.toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
}
