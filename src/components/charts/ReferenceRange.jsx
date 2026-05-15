// Pure div reference range visualisation.
// Shows a grey track with a green shaded normal range and a coloured dot for patient value(s).
// Props:
//   rangeMin, rangeMax: number — the "normal" shaded band
//   value: number (optional) — patient's single value
//   valueLeft, valueRight: number (optional) — bilateral patient values
//   displayMin, displayMax: number — axis extent
//   unit: string
//   color: string (Tailwind token for the patient dot)
export function ReferenceRange({ rangeMin, rangeMax, value, valueLeft, valueRight, displayMin, displayMax, unit, color, flags }) {
  const dMin = displayMin ?? 0
  const dMax = displayMax ?? (rangeMax ? rangeMax * 1.5 : 100)
  const range = dMax - dMin

  function pct(v) {
    return Math.max(0, Math.min(100, ((v - dMin) / range) * 100))
  }

  const rangePctLeft  = rangeMin !== null && rangeMin !== undefined ? pct(rangeMin) : null
  const rangePctRight = rangeMax !== null && rangeMax !== undefined ? pct(rangeMax) : null

  const colorMap = {
    'zone-green': '#22c55e', 'zone-amber': '#f59e0b',
    'zone-red': '#ef4444', 'zone-blue': '#3b82f6',
  }
  const resolvedColor = colorMap[color] ?? color ?? '#6b7280'

  function Dot({ val, shape = 'circle', label }) {
    const p = pct(val)
    const inRange = rangeMin !== null && rangeMax !== null && val >= rangeMin && val <= rangeMax
    const dotColor = inRange ? '#22c55e' : '#ef4444'
    return (
      <div
        className="absolute flex flex-col items-center"
        style={{ left: `${p}%`, transform: 'translateX(-50%)', top: '-8px' }}
        title={`${label}: ${val}${unit ? ` ${unit}` : ''}`}
      >
        {shape === 'circle' ? (
          <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ background: dotColor }} />
        ) : (
          <div className="w-3.5 h-3.5 border-2 border-white shadow rotate-45" style={{ background: dotColor }} />
        )}
        <span className="text-[9px] mt-0.5 text-gray-500 whitespace-nowrap">{label}</span>
      </div>
    )
  }

  return (
    <div className="w-full px-2">
      {/* Axis labels */}
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{dMin}{unit ? ` ${unit}` : ''}</span>
        {rangeMin !== null && <span className="text-gray-500">Normal: {rangeMin}–{rangeMax}{unit ? unit : ''}</span>}
        <span>{dMax}{unit ? ` ${unit}` : ''}</span>
      </div>

      {/* Track */}
      <div className="relative h-3 bg-gray-200 rounded-full">
        {/* Normal range band */}
        {rangePctLeft !== null && rangePctRight !== null && (
          <div
            className="absolute top-0 bottom-0 rounded-full bg-green-200"
            style={{ left: `${rangePctLeft}%`, width: `${rangePctRight - rangePctLeft}%` }}
          />
        )}

        {/* Patient dot(s) */}
        {value !== null && value !== undefined && !isNaN(value) && (
          <Dot val={parseFloat(value)} label="Result" />
        )}
        {valueLeft !== null && valueLeft !== undefined && !isNaN(valueLeft) && (
          <Dot val={parseFloat(valueLeft)} shape="circle" label="L" />
        )}
        {valueRight !== null && valueRight !== undefined && !isNaN(valueRight) && (
          <Dot val={parseFloat(valueRight)} shape="square" label="R" />
        )}
      </div>

      {/* Asymmetry / flag note */}
      {flags && flags.length > 0 && (
        <div className="mt-3 space-y-1">
          {flags.map((f, i) => (
            <p key={i} className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              ⚑ {f}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
