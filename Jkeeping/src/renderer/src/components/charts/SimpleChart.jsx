import React from 'react'
import styles from './SimpleChart.module.css'

/**
 * Simple Chart Component
 * Lightweight SVG-based chart for displaying financial trends
 * No external dependencies required
 */
const SimpleChart = ({ data, width = 600, height = 300, type = 'line' }) => {
  if (!data || data.length === 0) {
    return <div className={styles.empty}>No data available</div>
  }

  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Find min and max values
  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values, 0)
  const valueRange = maxValue - minValue || 1

  // Calculate points for line chart
  const points = data
    .map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth
      const y = padding + chartHeight - ((d.value - minValue) / valueRange) * chartHeight
      return `${x},${y}`
    })
    .join(' ')

  // Generate bars for bar chart
  const bars = data.map((d, i) => {
    const barWidth = chartWidth / data.length - 10
    const x = padding + (i / data.length) * chartWidth + 5
    const barHeight = ((d.value - minValue) / valueRange) * chartHeight
    const y = padding + chartHeight - barHeight

    return (
      <rect
        key={i}
        x={x}
        y={y}
        width={barWidth}
        height={barHeight}
        fill="#3b82f6"
        rx="4"
      />
    )
  })

  return (
    <div className={styles.container}>
      <svg width={width} height={height} className={styles.svg}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((factor, i) => {
          const y = padding + chartHeight * (1 - factor)
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text x={padding - 10} y={y + 4} className={styles.label} textAnchor="end">
                ${((minValue + valueRange * factor) / 1000).toFixed(0)}k
              </text>
            </g>
          )
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * chartWidth
          return (
            <text
              key={i}
              x={x}
              y={height - padding + 20}
              className={styles.label}
              textAnchor="middle"
            >
              {d.label}
            </text>
          )
        })}

        {/* Chart content */}
        {type === 'line' ? (
          <>
            <polyline
              points={points}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Data points */}
            {data.map((d, i) => {
              const x = padding + (i / (data.length - 1)) * chartWidth
              const y = padding + chartHeight - ((d.value - minValue) / valueRange) * chartHeight
              return (
                <circle key={i} cx={x} cy={y} r="5" fill="#3b82f6" className={styles.dot} />
              )
            })}
          </>
        ) : (
          bars
        )}
      </svg>
    </div>
  )
}

export default SimpleChart
