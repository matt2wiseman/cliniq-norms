import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts'

// Generates a normal distribution curve dataset.
function generateBellCurve(points = 80) {
  const data = []
  const step = 7 / points
  for (let i = 0; i <= points; i++) {
    const z = -3.5 + i * step
    const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z)
    data.push({ z: parseFloat(z.toFixed(3)), y: parseFloat(y.toFixed(4)) })
  }
  return data
}

export function PercentileBar({ percentile, zScore, label }) {
  const bellData = useMemo(() => generateBellCurve(), [])

  if (percentile === null || percentile === undefined) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
        Percentile data not available for this demographic
      </div>
    )
  }

  const z = zScore ?? 0
  const clampedZ = Math.max(-3.5, Math.min(3.5, z))

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">Normative distribution</span>
        <span className="text-sm font-bold text-brand-navy">{percentile}th percentile</span>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={bellData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
          <XAxis
            dataKey="z"
            type="number"
            domain={[-3.5, 3.5]}
            ticks={[-3, -2, -1, 0, 1, 2, 3]}
            tickFormatter={v => ['−3', '−2', '−1', '0', '+1', '+2', '+3'][v + 3] ?? v}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Area
            type="monotone"
            dataKey="y"
            stroke="#0f4c81"
            strokeWidth={2}
            fill="#dbeafe"
            fillOpacity={0.6}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceLine
            x={clampedZ}
            stroke="#0f4c81"
            strokeWidth={2}
            strokeDasharray="4 2"
            label={{
              value: `${percentile}th`,
              position: clampedZ > 0 ? 'insideTopLeft' : 'insideTopRight',
              fontSize: 11,
              fill: '#0f4c81',
              fontWeight: 'bold',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-2">
        <span>Lowest</span>
        <span>Average</span>
        <span>Highest</span>
      </div>
    </div>
  )
}
