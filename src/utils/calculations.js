// ─────────────────────────────────────────────────────────────────────────────
// Pure calculation utilities — no side effects, no imports from norms.
// ─────────────────────────────────────────────────────────────────────────────

export function calcBMI(heightCm, weightKg) {
  const h = parseFloat(heightCm)
  const w = parseFloat(weightKg)
  if (!h || !w || h <= 0 || w <= 0) return null
  const hM = h / 100
  return parseFloat((w / (hM * hM)).toFixed(1))
}

export function calcWHR(waistCm, hipCm) {
  const waist = parseFloat(waistCm)
  const hip = parseFloat(hipCm)
  if (!waist || !hip || hip <= 0) return null
  return parseFloat((waist / hip).toFixed(3))
}

// Tanaka H, et al. (2001). Age-predicted maximal heart rate revisited. JACC, 37(1), 153-6.
// Fox SM & Haskell WL. (1970). Physical activity and the prevention of coronary heart disease.
// Gelish RL, et al. (2007). Longitudinal modeling of the relationship between age and maximal HR. Med Sci Sports Exerc.
export function calcHRMax(age, formula = 'tanaka') {
  const a = parseFloat(age)
  if (!a) return null
  switch (formula) {
    case 'tanaka': return Math.round(208 - 0.7 * a)
    case 'fox':    return Math.round(220 - a)
    case 'gelish': return Math.round(207 - 0.7 * a)
    default:       return Math.round(208 - 0.7 * a)
  }
}

// Enright PL & Sherrill DL. (1998). Am J Respir Crit Care Med, 158(5), 1384-7.
export function calc6MWTPredicted(sex, heightCm, age, weightKg) {
  const h = parseFloat(heightCm)
  const a = parseFloat(age)
  const w = parseFloat(weightKg)
  if (!h || !a || !w) return null
  if (sex === 'male')   return Math.round(7.57 * h - 5.02 * a - 1.76 * w - 309)
  if (sex === 'female') return Math.round(2.11 * h - 5.78 * a - 2.29 * w + 667)
  return null // 'other' — requires sex specification
}

// Finds the matching age band from an array of { minAge, maxAge } objects.
export function getAgeBand(age, bands) {
  const a = parseInt(age, 10)
  if (isNaN(a)) return null
  return bands.find(b => a >= b.minAge && a <= (b.maxAge ?? Infinity)) ?? null
}

// Maps an age to a standardised age-band label used in categorical norm tables.
// e.g. age 35 → '30-39', age 65 → '60+'
export function getAgeBandLabel(age, bandKeys) {
  const a = parseInt(age, 10)
  if (isNaN(a)) return null
  for (const key of bandKeys) {
    const match = key.match(/^(\d+)[-+](\d+)?$/)
    if (!match) continue
    const min = parseInt(match[1], 10)
    const max = match[2] ? parseInt(match[2], 10) : Infinity
    if (a >= min && a <= max) return key
  }
  return null
}

// Abramowitz & Stegun approximation — accurate to 4 decimal places.
// Returns percentile (0–100).
export function zToPercentile(z) {
  if (z === null || z === undefined || isNaN(z)) return null
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const poly =
    t * (0.31938153 +
    t * (-0.356563782 +
    t * (1.781477937 +
    t * (-1.821255978 +
    t * 1.330274429))))
  const phi = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly
  const p = z >= 0 ? phi : 1 - phi
  return Math.round(Math.max(1, Math.min(99, p * 100)))
}

// Deurenberg P, et al. (1991). Body mass index as a measure of body fatness.
// Br J Nutr, 65(2), 105-14.
export function estimateBodyFatDeurenberg(bmi, age, sex) {
  if (!bmi || !age) return null
  const sexVal = sex === 'male' ? 1 : 0
  return parseFloat((1.20 * bmi + 0.23 * parseFloat(age) - 10.8 * sexVal - 5.4).toFixed(1))
}
