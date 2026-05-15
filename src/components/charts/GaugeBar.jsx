// markerPct: optional 0-100 proportional override. If omitted, centres inside activeCategory zone.
export function GaugeBar({ zones, activeCategory, markerPct: propMarkerPct }) {
  let cumulative = 0
  const zoneData = zones.map(zone => {
    const center = cumulative + zone.width / 2
    cumulative += zone.width
    return { ...zone, center }
  })

  let markerPct
  if (propMarkerPct !== undefined && propMarkerPct !== null) {
    markerPct = Math.min(98, Math.max(2, propMarkerPct))
  } else {
    const matchedZone = zoneData.find(z => z.label === activeCategory)
    markerPct = matchedZone?.center ?? null
  }

  return (
    <div className="w-full">
      <div className="relative h-5 flex rounded-full overflow-hidden">
        {zoneData.map((zone, i) => (
          <div
            key={i}
            style={{ width: `${zone.width}%`, background: zone.color }}
            className={`h-full ${activeCategory && zone.label !== activeCategory ? 'opacity-25' : ''}`}
            title={zone.label}
          />
        ))}
        {markerPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md"
            style={{ left: `${markerPct}%`, transform: 'translateX(-50%)' }}
          />
        )}
      </div>

      {markerPct !== null && (
        <div className="relative h-2.5 mt-0.5">
          <div
            className="absolute top-0 w-0"
            style={{
              left: `${markerPct}%`,
              transform: 'translateX(-50%)',
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '8px solid #1f2937',
            }}
          />
        </div>
      )}

      <div className="flex mt-1">
        {zoneData.map((zone, i) => (
          <div
            key={i}
            style={{ width: `${zone.width}%` }}
            className={activeCategory && zone.label !== activeCategory ? 'opacity-30' : ''}
          >
            <span className="text-[10px] leading-tight text-gray-600 break-words block px-0.5 text-center">
              {zone.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
