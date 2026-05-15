import {
  GRIP_STRENGTH_NORMS, SIT_TO_STAND_30S_NORMS, SIT_TO_STAND_5X_NORMS,
  PUSH_UP_NORMS, VO2MAX_NORMS, SIX_MWT_NORMS, RESTING_HR_NORMS,
  RESTING_BP_NORMS, BMI_NORMS, WAIST_CIRC_NORMS, WHR_NORMS,
  BODY_FAT_NORMS, TUG_NORMS, SINGLE_LEG_STANCE_NORMS, BERG_BALANCE_NORMS,
  SIT_REACH_NORMS, TWO_MIN_STEP_NORMS, COOPER_12MIN_NORMS,
  ONE_FIVE_MILE_NORMS, DEAD_HANG_NORMS, ISOMETRIC_SQUAT_NORMS, ROM_NORMS,
  STAGED_SIT_UP_NORMS, CURL_UP_NORMS, CERVICAL_FLEXOR_ENDURANCE_NORMS,
  CERVICAL_EXTENSION_ENDURANCE_NORMS, BIERING_SORENSEN_NORMS,
  MCGILL_BATTERY_NORMS, PRONE_BRIDGE_NORMS, KNEE_TO_WALL_NORMS,
  SPPB_NORMS, FOUR_SQUARE_STEP_NORMS, SPO2_NORMS,
} from '../data/norms.js'
import { getAgeBand, getAgeBandLabel, zToPercentile, calc6MWTPredicted } from './calculations.js'

// ─── ScoreResult factory ──────────────────────────────────────────────────────
function result(overrides) {
  return {
    category: null, color: null, percentile: null, zScore: null,
    rangeMin: null, rangeMax: null, predicted: null, pctPredicted: null,
    flags: [], insufficient: false, insufficientReason: null,
    caveat: null, source: null,
    ...overrides,
  }
}

function insufficientResult(reason, source) {
  return result({ insufficient: true, insufficientReason: reason, source })
}

// Picks a category from an ascending minValue array.
// categories[i] applies when value >= thresholds[i] and < thresholds[i+1].
function pickCategory(value, thresholds, categories, colors) {
  let idx = 0
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (value >= thresholds[i]) { idx = i; break }
  }
  return { category: categories[idx], color: colors[idx] }
}

// Picks category from a descending maxValue array (for 1.5-mile run — lower = better).
function pickCategoryDescending(value, maxValues, categories, colors) {
  for (let i = 0; i < maxValues.length; i++) {
    if (value <= maxValues[i]) return { category: categories[i], color: colors[i] }
  }
  return { category: categories[categories.length - 1], color: colors[colors.length - 1] }
}

// ─── Grip Strength ────────────────────────────────────────────────────────────
export function scoreGripStrength(value, demographics) {
  if (value === null || value === undefined || isNaN(parseFloat(value))) return null
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required. Select Male or Female normative table for comparison.', GRIP_STRENGTH_NORMS.source)
  const band = getAgeBand(age, GRIP_STRENGTH_NORMS.bands)
  if (!band) return insufficientResult(`No normative data for age ${age}.`, GRIP_STRENGTH_NORMS.source)
  const ref = sex === 'male' ? band.male : band.female
  const z = (parseFloat(value) - ref.mean) / ref.sd
  const percentile = zToPercentile(z)
  const category = percentile >= 84 ? 'Excellent' : percentile >= 68 ? 'Above Average'
    : percentile >= 32 ? 'Average' : percentile >= 16 ? 'Below Average' : 'Poor'
  const color = percentile >= 84 ? 'zone-blue' : percentile >= 50 ? 'zone-green'
    : percentile >= 16 ? 'zone-amber' : 'zone-red'
  return result({
    category, color, percentile, zScore: parseFloat(z.toFixed(2)),
    rangeMin: ref.mean - 2 * ref.sd, rangeMax: ref.mean + 2 * ref.sd,
    source: GRIP_STRENGTH_NORMS.source,
  })
}

// ─── Resting HR ───────────────────────────────────────────────────────────────
export function scoreRestingHR(value, demographics) {
  const hr = parseFloat(value)
  const zone = RESTING_HR_NORMS.zones.find(z => hr >= z.minHR && hr <= z.maxHR)
  const flags = []
  if (demographics.betablockers) flags.push(RESTING_HR_NORMS.betaBlockerNote)
  return result({
    category: zone?.label ?? 'Unknown',
    color: zone?.color ?? 'zone-amber',
    flags,
    source: RESTING_HR_NORMS.source,
  })
}

// ─── Resting BP ───────────────────────────────────────────────────────────────
export function scoreRestingBP(systolic, diastolic) {
  const s = parseFloat(systolic)
  const d = parseFloat(diastolic)
  for (const cat of RESTING_BP_NORMS.categories) {
    if (cat.match(s, d)) {
      return result({ category: cat.label, color: cat.color, source: RESTING_BP_NORMS.source })
    }
  }
  return result({ category: 'Normal', color: 'zone-green', source: RESTING_BP_NORMS.source })
}

// ─── BMI ──────────────────────────────────────────────────────────────────────
export function scoreBMI(bmi) {
  if (!bmi) return insufficientResult('Height and weight required.', BMI_NORMS.source)
  const zone = BMI_NORMS.zones.find(z => bmi >= z.minBMI && bmi <= z.maxBMI)
  return result({
    category: zone?.label ?? 'Unknown',
    color: zone?.color ?? 'zone-amber',
    rangeMin: 15, rangeMax: 45,
    source: BMI_NORMS.source,
  })
}

// ─── Waist Circumference ──────────────────────────────────────────────────────
export function scoreWaistCirc(value, demographics) {
  const { sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific cut-points required.', WAIST_CIRC_NORMS.source)
  const zones = sex === 'male' ? WAIST_CIRC_NORMS.male : WAIST_CIRC_NORMS.female
  const zone = zones.find(z => parseFloat(value) >= z.minVal && parseFloat(value) <= z.maxVal)
  return result({ category: zone?.label ?? 'Unknown', color: zone?.color ?? 'zone-amber', source: WAIST_CIRC_NORMS.source })
}

// ─── Waist-to-Hip Ratio ───────────────────────────────────────────────────────
export function scoreWHR(value, demographics) {
  const { sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific cut-points required.', WHR_NORMS.source)
  const zones = sex === 'male' ? WHR_NORMS.male : WHR_NORMS.female
  const zone = zones.find(z => parseFloat(value) >= z.minVal && parseFloat(value) <= z.maxVal)
  return result({ category: zone?.label ?? 'Unknown', color: zone?.color ?? 'zone-amber', source: WHR_NORMS.source })
}

// ─── Body Fat % ───────────────────────────────────────────────────────────────
export function scoreBodyFat(value, demographics) {
  const { sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', BODY_FAT_NORMS.source)
  const zones = sex === 'male' ? BODY_FAT_NORMS.male : BODY_FAT_NORMS.female
  const zone = zones.find(z => parseFloat(value) >= z.minVal && parseFloat(value) <= z.maxVal)
  return result({ category: zone?.label ?? 'Unknown', color: zone?.color ?? 'zone-amber', source: BODY_FAT_NORMS.source })
}

// ─── VO2max ───────────────────────────────────────────────────────────────────
export function scoreVO2Max(value, demographics) {
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', VO2MAX_NORMS.source)
  const table = sex === 'male' ? VO2MAX_NORMS.male : VO2MAX_NORMS.female
  const bandLabel = getAgeBandLabel(age, Object.keys(table))
  if (!bandLabel) return insufficientResult(`No normative data for age ${age}.`, VO2MAX_NORMS.source)
  const thresholds = table[bandLabel]
  const { category, color } = pickCategory(parseFloat(value), thresholds, VO2MAX_NORMS.categories, VO2MAX_NORMS.colors)
  return result({ category, color, source: VO2MAX_NORMS.source })
}

// ─── 6-Minute Walk Test ───────────────────────────────────────────────────────
export function score6MWT(actual, demographics) {
  const { age, sex, height, weight } = demographics
  if (sex === 'other') return insufficientResult('Prediction equation requires sex specification.', SIX_MWT_NORMS.source)
  const predicted = calc6MWTPredicted(sex, height, age, weight)
  if (!predicted) return insufficientResult('Height, weight, age, and sex required for prediction.', SIX_MWT_NORMS.source)
  const pctPredicted = parseFloat(((parseFloat(actual) / predicted) * 100).toFixed(1))
  const category = pctPredicted >= 100 ? 'At or Above Predicted'
    : pctPredicted >= 80 ? 'Slightly Below Predicted'
    : pctPredicted >= 60 ? 'Moderately Below Predicted'
    : 'Significantly Below Predicted'
  const color = pctPredicted >= 100 ? 'zone-green'
    : pctPredicted >= 80 ? 'zone-amber'
    : 'zone-red'
  return result({ category, color, predicted, pctPredicted, source: SIX_MWT_NORMS.source })
}

// ─── 2-Minute Step Test ───────────────────────────────────────────────────────
export function score2MinStep(value, demographics) {
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', TWO_MIN_STEP_NORMS.source)
  const band = getAgeBand(parseInt(age, 10), TWO_MIN_STEP_NORMS.bands)
  if (!band) return insufficientResult(`Norms available for ages 60+. No data for age ${age}.`, TWO_MIN_STEP_NORMS.source)
  const ref = sex === 'male' ? band.male : band.female
  const v = parseInt(value, 10)
  const category = v > ref.high ? 'Above Normal Range' : v >= ref.low ? 'Within Normal Range' : 'Below Normal Range'
  const color = v > ref.high ? 'zone-blue' : v >= ref.low ? 'zone-green' : 'zone-red'
  return result({ category, color, rangeMin: ref.low, rangeMax: ref.high, source: TWO_MIN_STEP_NORMS.source })
}

// ─── 30s Sit to Stand ─────────────────────────────────────────────────────────
export function score30sSitToStand(value, demographics) {
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', SIT_TO_STAND_30S_NORMS.source)
  const band = getAgeBand(parseInt(age, 10), SIT_TO_STAND_30S_NORMS.bands)
  if (!band) return insufficientResult(`No normative data for age ${age}.`, SIT_TO_STAND_30S_NORMS.source)
  const ref = sex === 'male' ? band.male : band.female
  const v = parseInt(value, 10)
  const category = v > ref.high ? 'Above Normal Range' : v >= ref.low ? 'Within Normal Range' : 'Below Normal Range'
  const color = v > ref.high ? 'zone-blue' : v >= ref.low ? 'zone-green' : 'zone-red'
  return result({ category, color, rangeMin: ref.low, rangeMax: ref.high, source: SIT_TO_STAND_30S_NORMS.source })
}

// ─── 5× Sit to Stand ─────────────────────────────────────────────────────────
export function score5xSitToStand(value, demographics) {
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', SIT_TO_STAND_5X_NORMS.source)
  const band = getAgeBand(parseInt(age, 10), SIT_TO_STAND_5X_NORMS.bands)
  if (!band) return insufficientResult(`No normative data for age ${age}.`, SIT_TO_STAND_5X_NORMS.source)
  const ref = sex === 'male' ? band.male : band.female
  // Lower time = better: invert z-score
  const z = -(parseFloat(value) - ref.mean) / ref.sd
  const percentile = zToPercentile(z)
  const category = percentile >= 84 ? 'Excellent' : percentile >= 68 ? 'Above Average'
    : percentile >= 32 ? 'Average' : percentile >= 16 ? 'Below Average' : 'Poor'
  const color = percentile >= 84 ? 'zone-blue' : percentile >= 50 ? 'zone-green'
    : percentile >= 16 ? 'zone-amber' : 'zone-red'
  return result({
    category, color, percentile, zScore: parseFloat(z.toFixed(2)),
    rangeMin: ref.mean - 2 * ref.sd, rangeMax: ref.mean + 2 * ref.sd,
    source: SIT_TO_STAND_5X_NORMS.source,
  })
}

// ─── Push-Up Test ─────────────────────────────────────────────────────────────
export function scorePushUp(value, demographics) {
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', PUSH_UP_NORMS.source)
  const table = sex === 'male' ? PUSH_UP_NORMS.male : PUSH_UP_NORMS.female
  const bandLabel = getAgeBandLabel(age, Object.keys(table))
  if (!bandLabel) return insufficientResult(`No normative data for age ${age}.`, PUSH_UP_NORMS.source)
  const thresholds = table[bandLabel]
  const { category, color } = pickCategory(parseInt(value, 10), thresholds, PUSH_UP_NORMS.categories, PUSH_UP_NORMS.colors)
  return result({ category, color, source: PUSH_UP_NORMS.source })
}

// ─── Dead Hang ────────────────────────────────────────────────────────────────
export function scoreDeadHang(value, demographics) {
  const { sex } = demographics
  const thresholds = sex === 'female' ? DEAD_HANG_NORMS.female : DEAD_HANG_NORMS.male
  const { category, color } = pickCategory(parseFloat(value), thresholds, DEAD_HANG_NORMS.categories, DEAD_HANG_NORMS.colors)
  return result({ category, color, caveat: DEAD_HANG_NORMS.caveat, source: DEAD_HANG_NORMS.source })
}

// ─── Isometric Squat ─────────────────────────────────────────────────────────
export function scoreIsometricSquat(value, demographics) {
  const { sex } = demographics
  const thresholds = sex === 'female' ? ISOMETRIC_SQUAT_NORMS.female : ISOMETRIC_SQUAT_NORMS.male
  const { category, color } = pickCategory(parseFloat(value), thresholds, ISOMETRIC_SQUAT_NORMS.categories, ISOMETRIC_SQUAT_NORMS.colors)
  return result({ category, color, caveat: ISOMETRIC_SQUAT_NORMS.caveat, source: ISOMETRIC_SQUAT_NORMS.source })
}

// ─── Sit and Reach ────────────────────────────────────────────────────────────
export function scoreSitAndReach(value, demographics) {
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', SIT_REACH_NORMS.source)
  const table = sex === 'male' ? SIT_REACH_NORMS.male : SIT_REACH_NORMS.female
  const bandLabel = getAgeBandLabel(age, Object.keys(table))
  if (!bandLabel) return insufficientResult(`No normative data for age ${age}.`, SIT_REACH_NORMS.source)
  const thresholds = table[bandLabel]
  const { category, color } = pickCategory(parseFloat(value), thresholds, SIT_REACH_NORMS.categories, SIT_REACH_NORMS.colors)
  return result({ category, color, source: SIT_REACH_NORMS.source })
}

// ─── TUG ──────────────────────────────────────────────────────────────────────
export function scoreTUG(value, demographics) {
  const { age } = demographics
  const band = getAgeBand(parseInt(age, 10), TUG_NORMS.bands)
  const v = parseFloat(value)
  const flags = []
  if (v > TUG_NORMS.fallRiskThreshold) flags.push(TUG_NORMS.fallRiskNote)
  if (!band) {
    const category = v <= 10 ? 'Normal' : v <= 12 ? 'Borderline' : 'At Risk'
    const color = v <= 10 ? 'zone-green' : v <= 12 ? 'zone-amber' : 'zone-red'
    return result({ category, color, flags, source: TUG_NORMS.source })
  }
  // Lower time = better: invert z
  const z = -(v - band.mean) / band.sd
  const percentile = zToPercentile(z)
  const category = v > TUG_NORMS.fallRiskThreshold ? 'At Risk for Falls'
    : percentile >= 68 ? 'Excellent' : percentile >= 32 ? 'Average' : 'Below Average'
  const color = v > TUG_NORMS.fallRiskThreshold ? 'zone-red'
    : percentile >= 68 ? 'zone-blue' : percentile >= 32 ? 'zone-green' : 'zone-amber'
  return result({
    category, color, percentile, zScore: parseFloat(z.toFixed(2)),
    rangeMin: band.mean - 2 * band.sd, rangeMax: band.mean + 2 * band.sd,
    flags, source: TUG_NORMS.source,
  })
}

// ─── Single Leg Stance ────────────────────────────────────────────────────────
export function scoreSingleLegStance(value, condition, demographics) {
  const { age } = demographics
  const bands = condition === 'closed' ? SINGLE_LEG_STANCE_NORMS.eyesClosed : SINGLE_LEG_STANCE_NORMS.eyesOpen
  const band = getAgeBand(parseInt(age, 10), bands)
  if (!band) return insufficientResult(`No normative data for age ${age}.`, SINGLE_LEG_STANCE_NORMS.source)
  const z = (parseFloat(value) - band.mean) / band.sd
  const percentile = zToPercentile(z)
  const category = percentile >= 84 ? 'Excellent' : percentile >= 50 ? 'Average' : percentile >= 16 ? 'Below Average' : 'Poor'
  const color = percentile >= 84 ? 'zone-blue' : percentile >= 50 ? 'zone-green' : percentile >= 16 ? 'zone-amber' : 'zone-red'
  return result({
    category, color, percentile, zScore: parseFloat(z.toFixed(2)),
    rangeMin: Math.max(0, band.mean - 2 * band.sd), rangeMax: band.mean + 2 * band.sd,
    source: SINGLE_LEG_STANCE_NORMS.source,
  })
}

// ─── Berg Balance Scale ───────────────────────────────────────────────────────
export function scoreBergBalance(value) {
  const v = parseInt(value, 10)
  const interp = BERG_BALANCE_NORMS.interpretation.find(i => v >= i.minScore && v <= i.maxScore)
  const flags = []
  if (v < BERG_BALANCE_NORMS.increasedFallRiskThreshold) flags.push(BERG_BALANCE_NORMS.increasedFallRiskNote)
  return result({
    category: interp?.label ?? 'Unknown',
    color: interp?.color ?? 'zone-amber',
    flags,
    rangeMin: 0, rangeMax: 56,
    source: BERG_BALANCE_NORMS.source,
  })
}

// ─── Cooper 12-min Run ────────────────────────────────────────────────────────
export function scoreCooper12min(value, demographics) {
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', COOPER_12MIN_NORMS.source)
  const table = sex === 'male' ? COOPER_12MIN_NORMS.male : COOPER_12MIN_NORMS.female
  const bandLabel = getAgeBandLabel(age, Object.keys(table))
  if (!bandLabel) return insufficientResult(`No normative data for age ${age}.`, COOPER_12MIN_NORMS.source)
  const thresholds = table[bandLabel]
  const { category, color } = pickCategory(parseFloat(value), thresholds, COOPER_12MIN_NORMS.categories, COOPER_12MIN_NORMS.colors)
  return result({ category, color, source: COOPER_12MIN_NORMS.source })
}

// ─── 1.5-Mile Run ────────────────────────────────────────────────────────────
export function score1point5MileRun(value, demographics) {
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', ONE_FIVE_MILE_NORMS.source)
  const table = sex === 'male' ? ONE_FIVE_MILE_NORMS.male : ONE_FIVE_MILE_NORMS.female
  const bandLabel = getAgeBandLabel(age, Object.keys(table))
  if (!bandLabel) return insufficientResult(`No normative data for age ${age}.`, ONE_FIVE_MILE_NORMS.source)
  const maxTimes = table[bandLabel]
  const { category, color } = pickCategoryDescending(parseFloat(value), maxTimes, ONE_FIVE_MILE_NORMS.categories, ONE_FIVE_MILE_NORMS.colors)
  return result({ category, color, source: ONE_FIVE_MILE_NORMS.source })
}

// ─── ROM ──────────────────────────────────────────────────────────────────────
function scoreROMSide(value, joint) {
  const v = parseFloat(value)
  if (isNaN(v)) return null
  const withinNormal = v >= joint.normalMin && v <= joint.normalMax
  const category = withinNormal ? 'Within Normal Range' : 'Outside Normal Range'
  const color = withinNormal ? 'zone-green' : 'zone-red'
  return result({ category, color, rangeMin: joint.normalMin, rangeMax: joint.normalMax, source: ROM_NORMS.source, flags: [] })
}

export function scoreROM(leftValue, rightValue, jointId) {
  const joint = ROM_NORMS.joints[jointId]
  if (!joint) return [null, null]

  const leftResult  = scoreROMSide(leftValue, joint)
  const rightResult = scoreROMSide(rightValue, joint)

  const lv = parseFloat(leftValue)
  const rv = parseFloat(rightValue)
  if (!isNaN(lv) && !isNaN(rv)) {
    const diff = Math.abs(lv - rv)
    if (diff >= ROM_NORMS.asymmetryThreshold) {
      const msg = `Side-to-side asymmetry: ${diff}° difference (L: ${lv}°, R: ${rv}°). ${ROM_NORMS.asymmetryNote}`
      if (leftResult) leftResult.flags.push(msg)
      if (rightResult) rightResult.flags.push(msg)
    }
  }

  return [leftResult, rightResult]
}

export function scoreSingleROM(value, jointId) {
  const joint = ROM_NORMS.joints[jointId]
  if (!joint) return null
  return scoreROMSide(value, joint)
}

// ─── SpO2 ─────────────────────────────────────────────────────────────────────
export function scoreSpO2(resultEntry) {
  const resting = parseFloat(resultEntry?.resting)
  if (isNaN(resting)) return insufficientResult('Resting SpO2 value required.', SPO2_NORMS.source)
  const zone = SPO2_NORMS.zones.find(z => resting >= z.minVal && resting <= z.maxVal)
  const flags = []
  if (resultEntry.supplementalO2) {
    flags.push(`Patient on supplemental oxygen${resultEntry.flowRate ? ` at ${resultEntry.flowRate} L/min` : ''}`)
  }
  const postEx = parseFloat(resultEntry?.postExercise)
  if (!isNaN(postEx)) {
    const drop = resting - postEx
    if (drop >= SPO2_NORMS.desaturationThreshold) {
      flags.push(`Exercise-induced desaturation: ${resting}% → ${postEx}% (drop of ${drop}%). ${SPO2_NORMS.desaturationNote}`)
    }
  }
  return result({ category: zone?.label ?? 'Unknown', color: zone?.color ?? 'zone-amber', flags, source: SPO2_NORMS.source })
}

// ─── Staged Sit-Up ────────────────────────────────────────────────────────────
export function scoreStagedSitUp(value, demographics) {
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', STAGED_SIT_UP_NORMS.source)
  const table = sex === 'male' ? STAGED_SIT_UP_NORMS.male : STAGED_SIT_UP_NORMS.female
  const bandLabel = getAgeBandLabel(age, Object.keys(table))
  if (!bandLabel) return insufficientResult(`No normative data for age ${age}.`, STAGED_SIT_UP_NORMS.source)
  const thresholds = table[bandLabel]
  const { category, color } = pickCategory(parseInt(value, 10), thresholds, STAGED_SIT_UP_NORMS.categories, STAGED_SIT_UP_NORMS.colors)
  return result({ category, color, source: STAGED_SIT_UP_NORMS.source })
}

// ─── Curl-Up ──────────────────────────────────────────────────────────────────
export function scoreCurlUp(value, demographics) {
  const { age, sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', CURL_UP_NORMS.source)
  const table = sex === 'male' ? CURL_UP_NORMS.male : CURL_UP_NORMS.female
  const bandLabel = getAgeBandLabel(age, Object.keys(table))
  if (!bandLabel) return insufficientResult(`No normative data for age ${age}.`, CURL_UP_NORMS.source)
  const thresholds = table[bandLabel]
  const { category, color } = pickCategory(parseInt(value, 10), thresholds, CURL_UP_NORMS.categories, CURL_UP_NORMS.colors)
  return result({ category, color, source: CURL_UP_NORMS.source })
}

// ─── Cervical Flexor Endurance ────────────────────────────────────────────────
export function scoreCervicalFlexorEndurance(value) {
  const { category, color } = pickCategory(parseFloat(value), CERVICAL_FLEXOR_ENDURANCE_NORMS.thresholds, CERVICAL_FLEXOR_ENDURANCE_NORMS.categories, CERVICAL_FLEXOR_ENDURANCE_NORMS.colors)
  return result({ category, color, caveat: CERVICAL_FLEXOR_ENDURANCE_NORMS.caveat, source: CERVICAL_FLEXOR_ENDURANCE_NORMS.source })
}

// ─── Cervical Extension Endurance ────────────────────────────────────────────
export function scoreCervicalExtensionEndurance(value) {
  const { category, color } = pickCategory(parseFloat(value), CERVICAL_EXTENSION_ENDURANCE_NORMS.thresholds, CERVICAL_EXTENSION_ENDURANCE_NORMS.categories, CERVICAL_EXTENSION_ENDURANCE_NORMS.colors)
  return result({ category, color, caveat: CERVICAL_EXTENSION_ENDURANCE_NORMS.caveat, source: CERVICAL_EXTENSION_ENDURANCE_NORMS.source })
}

// ─── Biering-Sørensen ─────────────────────────────────────────────────────────
export function scoreBieringSorensen(value, demographics) {
  const { sex } = demographics
  if (sex === 'other') return insufficientResult('Sex-specific norms required.', BIERING_SORENSEN_NORMS.source)
  const norms = sex === 'male' ? BIERING_SORENSEN_NORMS.male : BIERING_SORENSEN_NORMS.female
  const { category, color } = pickCategory(parseFloat(value), norms.thresholds, norms.categories, norms.colors)
  return result({ category, color, source: BIERING_SORENSEN_NORMS.source })
}

// ─── McGill Trunk Endurance Battery ───────────────────────────────────────────
// resultEntry: { flexor, extensor, sideBridgeLeft, sideBridgeRight }
export function scoreMcGillBattery(resultEntry) {
  const { flexor, extensor, sideBridgeLeft, sideBridgeRight } = resultEntry
  const flags = []
  const scores = {}

  function scoreComponent(value, thresholds) {
    if (value == null || isNaN(parseFloat(value))) return null
    const { category, color } = pickCategory(parseFloat(value), thresholds, MCGILL_BATTERY_NORMS.categories, MCGILL_BATTERY_NORMS.colors)
    return { category, color, value: parseFloat(value) }
  }

  scores.flexor      = scoreComponent(flexor, MCGILL_BATTERY_NORMS.flexorThresholds)
  scores.extensor    = scoreComponent(extensor, MCGILL_BATTERY_NORMS.extensorThresholds)
  scores.sideBridgeLeft  = scoreComponent(sideBridgeLeft, MCGILL_BATTERY_NORMS.sideBridgeThresholds)
  scores.sideBridgeRight = scoreComponent(sideBridgeRight, MCGILL_BATTERY_NORMS.sideBridgeThresholds)

  // Ratio analysis
  if (scores.flexor && scores.extensor && scores.extensor.value > 0) {
    const flexExtRatio = scores.flexor.value / scores.extensor.value
    if (flexExtRatio > MCGILL_BATTERY_NORMS.ratioThresholds.flexExtRatio.max) {
      flags.push(`Flex:Ext ratio ${flexExtRatio.toFixed(2)} — ${MCGILL_BATTERY_NORMS.ratioThresholds.flexExtRatio.note}`)
    }
  }
  const avgSideBridge = (scores.sideBridgeLeft && scores.sideBridgeRight)
    ? (scores.sideBridgeLeft.value + scores.sideBridgeRight.value) / 2
    : (scores.sideBridgeLeft?.value ?? scores.sideBridgeRight?.value ?? null)
  if (avgSideBridge != null && scores.extensor && scores.extensor.value > 0) {
    const sbExtRatio = avgSideBridge / scores.extensor.value
    if (sbExtRatio < MCGILL_BATTERY_NORMS.ratioThresholds.sideBridgeExtRatio.min) {
      flags.push(`Side Bridge:Ext ratio ${sbExtRatio.toFixed(2)} — ${MCGILL_BATTERY_NORMS.ratioThresholds.sideBridgeExtRatio.note}`)
    }
  }
  if (scores.sideBridgeLeft && scores.sideBridgeRight) {
    const diff = Math.abs(scores.sideBridgeLeft.value - scores.sideBridgeRight.value)
    const maxSide = Math.max(scores.sideBridgeLeft.value, scores.sideBridgeRight.value)
    if (maxSide > 0 && diff / maxSide > 0.15) {
      flags.push(`Side bridge asymmetry: L ${scores.sideBridgeLeft.value}s vs R ${scores.sideBridgeRight.value}s (>15% difference)`)
    }
  }

  return { scores, flags, source: MCGILL_BATTERY_NORMS.source }
}

// ─── Prone Bridge ─────────────────────────────────────────────────────────────
export function scoreProneBridge(value) {
  const { category, color } = pickCategory(parseFloat(value), PRONE_BRIDGE_NORMS.thresholds, PRONE_BRIDGE_NORMS.categories, PRONE_BRIDGE_NORMS.colors)
  return result({ category, color, caveat: PRONE_BRIDGE_NORMS.caveat, source: PRONE_BRIDGE_NORMS.source })
}

// ─── Single Leg Squat ─────────────────────────────────────────────────────────
// resultEntry: { leftResult: 'pass'|'fail', rightResult: 'pass'|'fail', leftFaults: string[], rightFaults: string[], notes: string }
// Returns a custom shape — not the standard ScoreResult.
export function scoreSingleLegSquat(resultEntry) {
  const { leftResult, rightResult } = resultEntry
  const flags = []
  if (leftResult === 'fail' && resultEntry.leftFaults?.length) {
    flags.push(`Left: ${resultEntry.leftFaults.join(', ')}`)
  }
  if (rightResult === 'fail' && resultEntry.rightFaults?.length) {
    flags.push(`Right: ${resultEntry.rightFaults.join(', ')}`)
  }
  const both = leftResult != null && rightResult != null
  const passCount = [leftResult, rightResult].filter(r => r === 'pass').length
  const category = !both ? (leftResult ?? rightResult) === 'pass' ? 'Pass' : 'Fail'
    : passCount === 2 ? 'Bilateral Pass' : passCount === 1 ? 'Unilateral Fail' : 'Bilateral Fail'
  const color = category.includes('Fail') ? 'zone-red' : 'zone-green'
  return result({ category, color, flags, source: 'Crossley KM, et al. (2011). Br J Sports Med, 45(3), 198-202.' })
}

// ─── Knee to Wall ─────────────────────────────────────────────────────────────
// resultEntry: { left: number|null, right: number|null, unit: 'cm'|'deg' }
export function scoreKneeToWall(resultEntry) {
  function scoreSide(value) {
    if (value == null || isNaN(parseFloat(value))) return null
    const v = parseFloat(value)
    const { category, color } = pickCategory(v, KNEE_TO_WALL_NORMS.thresholds, KNEE_TO_WALL_NORMS.categories, KNEE_TO_WALL_NORMS.colors)
    const flags = v < KNEE_TO_WALL_NORMS.restrictedThreshold
      ? [`Value <${KNEE_TO_WALL_NORMS.restrictedThreshold}cm indicates restricted weight-bearing ankle dorsiflexion`]
      : []
    return result({ category, color, flags, rangeMin: 0, rangeMax: 20, source: KNEE_TO_WALL_NORMS.source })
  }
  const leftRes  = scoreSide(resultEntry?.left)
  const rightRes = scoreSide(resultEntry?.right)
  if (leftRes && rightRes) {
    const diff = Math.abs((resultEntry.left) - (resultEntry.right))
    if (diff >= 2) {
      const msg = `Side-to-side asymmetry: ${diff.toFixed(1)}cm difference (L: ${resultEntry.left}cm, R: ${resultEntry.right}cm)`
      leftRes.flags.push(msg)
      rightRes.flags.push(msg)
    }
  }
  return { left: leftRes, right: rightRes }
}

// ─── SPPB ─────────────────────────────────────────────────────────────────────
// resultEntry: { balanceScore: 0-4, gaitScore: 0-4, chairStandScore: 0-4 }
export function scoreSPPB(resultEntry) {
  const { balanceScore, gaitScore, chairStandScore } = resultEntry
  const hasAll = [balanceScore, gaitScore, chairStandScore].every(v => v != null && !isNaN(parseInt(v, 10)))
  if (!hasAll) return insufficientResult('All three sub-test scores required.', SPPB_NORMS.source)
  const total = parseInt(balanceScore, 10) + parseInt(gaitScore, 10) + parseInt(chairStandScore, 10)
  const interp = SPPB_NORMS.interpretation.find(i => total >= i.minScore && total <= i.maxScore)
  const flags = total <= SPPB_NORMS.disabilityRiskThreshold ? [SPPB_NORMS.disabilityRiskNote] : []
  return result({
    category: interp?.label ?? 'Unknown',
    color: interp?.color ?? 'zone-amber',
    flags,
    rangeMin: 0, rangeMax: 12,
    source: SPPB_NORMS.source,
    value: total,
  })
}

// ─── Four Square Step Test ────────────────────────────────────────────────────
export function scoreFourSquareStep(value) {
  const v = parseFloat(value)
  const flags = v > FOUR_SQUARE_STEP_NORMS.fallRiskThreshold ? [FOUR_SQUARE_STEP_NORMS.fallRiskNote] : []
  const category = v <= 10 ? 'Low Fall Risk' : v <= 15 ? 'Borderline' : 'Increased Fall Risk'
  const color = v <= 10 ? 'zone-green' : v <= 15 ? 'zone-amber' : 'zone-red'
  return result({ category, color, flags, source: FOUR_SQUARE_STEP_NORMS.source })
}

// ─── CCFT ─────────────────────────────────────────────────────────────────────
// resultEntry: { achievedLevel: 22|24|26|28|30, notes: string }
export function scoreCCFT(resultEntry) {
  const level = parseInt(resultEntry?.achievedLevel, 10)
  if (!level || isNaN(level)) return insufficientResult('Achieved pressure level required.', 'Jull GA, et al. (2008). Therapeutic Exercise for Lumbopelvic Stabilization.')
  const category = level >= 30 ? 'Full Activation'
    : level >= 28 ? 'Near Full'
    : level >= 26 ? 'Moderate'
    : level >= 24 ? 'Mild'
    : 'Minimal'
  const color = level >= 28 ? 'zone-green' : level >= 26 ? 'zone-amber' : 'zone-red'
  return result({
    category, color,
    source: 'Jull GA, et al. (2008). Therapeutic Exercise for Lumbopelvic Stabilization. | Falla D, et al. (2004). Clin Neurophysiol, 115(2), 505-512.',
  })
}

// ─── Shoulder ER:IR Ratio ─────────────────────────────────────────────────────
// resultEntry: { leftER, leftIR, rightER, rightIR }
export function scoreShoulderERIR(resultEntry) {
  const { leftER, leftIR, rightER, rightIR } = resultEntry
  const flags = []
  const sides = {}

  function scoreSide(er, ir, side) {
    if (er == null || ir == null || isNaN(parseFloat(er)) || isNaN(parseFloat(ir))) return null
    const erV = parseFloat(er), irV = parseFloat(ir)
    if (irV === 0) return null
    const ratio = erV / irV
    const category = ratio < 0.60 ? 'High Risk (<0.60)' : ratio < 0.75 ? 'At Risk (0.60–0.74)' : ratio < 1.0 ? 'Acceptable (0.75–0.99)' : 'Optimal (≥1.00)'
    const color = ratio < 0.60 ? 'zone-red' : ratio < 0.75 ? 'zone-amber' : 'zone-green'
    if (ratio < 0.75) flags.push(`${side.charAt(0).toUpperCase() + side.slice(1)} ER:IR ratio ${ratio.toFixed(2)} — associated with increased shoulder injury risk (<0.75)`)
    return { category, color, ratio: parseFloat(ratio.toFixed(2)) }
  }

  sides.left  = scoreSide(leftER, leftIR, 'left')
  sides.right = scoreSide(rightER, rightIR, 'right')

  return {
    left: sides.left ? result({ category: sides.left.category, color: sides.left.color, source: 'Niederbracht Y, et al. (2008). J Strength Cond Res, 22(4), 1214-1218.' }) : null,
    right: sides.right ? result({ category: sides.right.category, color: sides.right.color, source: 'Niederbracht Y, et al. (2008). J Strength Cond Res, 22(4), 1214-1218.' }) : null,
    ratios: { left: sides.left?.ratio ?? null, right: sides.right?.ratio ?? null },
    flags,
    source: 'Niederbracht Y, et al. (2008). J Strength Cond Res, 22(4), 1214-1218.',
  }
}

// ─── Master dispatcher ────────────────────────────────────────────────────────
// resultEntry shape depends on inputType:
//   single:   { value: number }
//   bilateral:{ left: number, right: number, dominant?: 'left'|'right' }
//   bp:       { systolic: number, diastolic: number }
//   whr:      { waist: number, hip: number }
//   auto:     { value: number }  (BMI, pre-computed)
//   notes:    { notes: string }
export function scoreTest(testId, resultEntry, demographics) {
  if (!resultEntry) return null

  switch (testId) {
    case 'spo2':
      return scoreSpO2(resultEntry)

    case 'restingHR':
      return scoreRestingHR(resultEntry.value, demographics)

    case 'restingBP':
      return scoreRestingBP(resultEntry.systolic, resultEntry.diastolic)

    case 'vo2max':
      return scoreVO2Max(resultEntry.value, demographics)

    case 'sixMWT':
      return score6MWT(resultEntry.value, demographics)

    case 'twoMinStep':
      return score2MinStep(resultEntry.value, demographics)

    case 'oneFiveMileRun':
      return score1point5MileRun(resultEntry.value, demographics)

    case 'cooper12min':
      return scoreCooper12min(resultEntry.value, demographics)

    case 'bmi':
      return scoreBMI(resultEntry.value)

    case 'waistCirc':
      return scoreWaistCirc(resultEntry.value, demographics)

    case 'waistHipRatio':
      return scoreWHR(resultEntry.value, demographics)

    case 'bodyFatPct':
      return scoreBodyFat(resultEntry.value, demographics)

    case 'gripStrength': {
      const dominant = resultEntry.dominant || 'right'
      const primaryVal = resultEntry[dominant] ?? resultEntry.left ?? resultEntry.right
      const res = scoreGripStrength(primaryVal, demographics)
      const leftRes  = resultEntry.left  != null ? scoreGripStrength(resultEntry.left, demographics)  : null
      const rightRes = resultEntry.right != null ? scoreGripStrength(resultEntry.right, demographics) : null
      return { left: leftRes, right: rightRes, primary: res }
    }

    case 'sitToStand30':
      return score30sSitToStand(resultEntry.value, demographics)

    case 'sitToStand5x':
      return score5xSitToStand(resultEntry.value, demographics)

    case 'pushUp':
      return scorePushUp(resultEntry.value, demographics)

    case 'stagedSitUp':
      return scoreStagedSitUp(resultEntry.value, demographics)

    case 'curlUp':
      return scoreCurlUp(resultEntry.value, demographics)

    case 'cervicalFlexorEndurance':
      return scoreCervicalFlexorEndurance(resultEntry.value)

    case 'ccft':
      return scoreCCFT(resultEntry)

    case 'cervicalExtensionEndurance':
      return scoreCervicalExtensionEndurance(resultEntry.value)

    case 'cervicalLateralFlexionEndurance': {
      const lRes = resultEntry.left != null ? (() => {
        const { category, color } = pickCategory(parseFloat(resultEntry.left), CERVICAL_EXTENSION_ENDURANCE_NORMS.thresholds, CERVICAL_EXTENSION_ENDURANCE_NORMS.categories, CERVICAL_EXTENSION_ENDURANCE_NORMS.colors)
        return result({ category, color, source: 'No established peer-reviewed norms. Side-to-side asymmetry >15% may be clinically relevant.' })
      })() : null
      const rRes = resultEntry.right != null ? (() => {
        const { category, color } = pickCategory(parseFloat(resultEntry.right), CERVICAL_EXTENSION_ENDURANCE_NORMS.thresholds, CERVICAL_EXTENSION_ENDURANCE_NORMS.categories, CERVICAL_EXTENSION_ENDURANCE_NORMS.colors)
        return result({ category, color, source: 'No established peer-reviewed norms. Side-to-side asymmetry >15% may be clinically relevant.' })
      })() : null
      if (lRes && rRes) {
        const lv = parseFloat(resultEntry.left), rv = parseFloat(resultEntry.right)
        const maxV = Math.max(lv, rv)
        if (maxV > 0 && Math.abs(lv - rv) / maxV > 0.15) {
          const msg = `Side-to-side asymmetry: L ${lv}s vs R ${rv}s (>15% difference)`
          if (lRes) lRes.flags.push(msg)
          if (rRes) rRes.flags.push(msg)
        }
      }
      return { left: lRes, right: rRes }
    }

    case 'bieringSorensen':
      return scoreBieringSorensen(resultEntry.value, demographics)

    case 'mcGillBattery':
      return scoreMcGillBattery(resultEntry)

    case 'proneBridge':
      return scoreProneBridge(resultEntry.value)

    case 'singleLegSquat':
      return scoreSingleLegSquat(resultEntry)

    case 'hipAbductorStrength': {
      const lR = resultEntry.left != null ? (() => {
        const { category, color } = pickCategory(parseFloat(resultEntry.left), [0, 5, 10, 20], ['Poor', 'Below Average', 'Average', 'Good'], ['zone-red', 'zone-amber', 'zone-green', 'zone-blue'])
        return result({ category, color, source: 'Bohannon RW. (1997). J Phys Ther Sci, 9(2).' })
      })() : null
      const rR = resultEntry.right != null ? (() => {
        const { category, color } = pickCategory(parseFloat(resultEntry.right), [0, 5, 10, 20], ['Poor', 'Below Average', 'Average', 'Good'], ['zone-red', 'zone-amber', 'zone-green', 'zone-blue'])
        return result({ category, color, source: 'Bohannon RW. (1997). J Phys Ther Sci, 9(2).' })
      })() : null
      if (lR && rR) {
        const lv = parseFloat(resultEntry.left), rv = parseFloat(resultEntry.right)
        const maxV = Math.max(lv, rv)
        if (maxV > 0 && Math.abs(lv - rv) / maxV > 0.15) {
          const msg = `Hip abductor asymmetry: L ${lv}kg vs R ${rv}kg (>15% difference)`
          lR.flags.push(msg); rR.flags.push(msg)
        }
      }
      return { left: lR, right: rR }
    }

    case 'shoulderERIRRatio':
      return scoreShoulderERIR(resultEntry)

    case 'deadHang':
      return scoreDeadHang(resultEntry.value, demographics)

    case 'isometricSquat':
      return scoreIsometricSquat(resultEntry.value, demographics)

    case 'sitAndReach':
      return scoreSitAndReach(resultEntry.value, demographics)

    case 'tug':
      return scoreTUG(resultEntry.value, demographics)

    case 'singleLegStanceOpen': {
      const lRes = resultEntry.left != null ? scoreSingleLegStance(resultEntry.left, 'open', demographics) : null
      const rRes = resultEntry.right != null ? scoreSingleLegStance(resultEntry.right, 'open', demographics) : null
      return { left: lRes, right: rRes }
    }

    case 'singleLegStanceClosed': {
      const lRes = resultEntry.left != null ? scoreSingleLegStance(resultEntry.left, 'closed', demographics) : null
      const rRes = resultEntry.right != null ? scoreSingleLegStance(resultEntry.right, 'closed', demographics) : null
      return { left: lRes, right: rRes }
    }

    case 'bergBalance':
      return scoreBergBalance(resultEntry.value)

    case 'sppb':
      return scoreSPPB(resultEntry)

    case 'fourSquareStep':
      return scoreFourSquareStep(resultEntry.value)

    case 'kneeToWall':
      return scoreKneeToWall(resultEntry)

    // Single-value ROM tests
    case 'cervicalFlex': case 'cervicalExt': case 'lumbarFlex': case 'lumbarExt':
      return scoreSingleROM(resultEntry.value, testId)

    // Bilateral ROM tests
    case 'cervicalRot': case 'cervicalLatFlex': case 'thoracicRot': case 'lumbarLatFlex':
    case 'shoulderFlex': case 'shoulderAbd': case 'shoulderER': case 'shoulderIR':
    case 'shoulderExt': case 'shoulderHorizAdd':
    case 'elbowFlex': case 'elbowExt': case 'elbowPronation': case 'elbowSupination':
    case 'wristFlex': case 'wristExt': case 'wristRadDev': case 'wristUlnDev':
    case 'hipFlex': case 'hipExt': case 'hipAbd': case 'hipAdd': case 'hipIR': case 'hipER':
    case 'kneeFlexROM': case 'kneeExt':
    case 'ankleDorsi': case 'anklePlantar': case 'ankleInv': case 'ankleEve':
    case 'subtalarInv': case 'subtalarEve': {
      const [l, r] = scoreROM(resultEntry.left, resultEntry.right, testId)
      return { left: l, right: r }
    }

    // Notes-only tests — no scoring
    case 'sensation':
      return null

    default:
      return null
  }
}

// ─── Gauge zone builder ───────────────────────────────────────────────────────
// Returns { zones, activeCategory } where activeCategory = scoreRes.category.
// The marker always sits at the centre of the matching zone — no independent
// numeric positioning, so label and marker are guaranteed to agree.
export function buildGaugeProps(testId, scoreRes, rawValue = null, demographics = null) {
  if (!scoreRes || scoreRes.insufficient || !scoreRes.category) return null
  const cat = scoreRes.category

  // Compute proportional marker position
  let markerPct = null
  if (scoreRes.percentile != null) {
    markerPct = Math.min(98, Math.max(2, scoreRes.percentile))
  } else if (testId === 'bergBalance' && rawValue != null) {
    markerPct = Math.min(98, Math.max(2, (parseFloat(rawValue) / 56) * 100))
  } else if (testId === 'sppb' && rawValue != null) {
    markerPct = Math.min(98, Math.max(2, (parseFloat(rawValue) / 12) * 100))
  }

  // ─ colour helpers ─
  const R = '#ef4444', O = '#f97316', A = '#f59e0b'  // red, orange, amber
  const L = '#84cc16', G = '#22c55e', B = '#3b82f6', P = '#7c3aed'  // lime, green, blue, purple

  // ─ zone presets ─
  // 5-zone percentile (Poor / Below Avg / Average / Above Avg / Excellent)
  const pct5 = [
    { label: 'Poor',          color: R, width: 13 },
    { label: 'Below Average', color: A, width: 19 },
    { label: 'Average',       color: G, width: 36 },
    { label: 'Above Average', color: B, width: 19 },
    { label: 'Excellent',     color: P, width: 13 },
  ]
  // 4-zone percentile (Poor / Below Avg / Average / Excellent)
  const pct4 = [
    { label: 'Poor',          color: R, width: 16 },
    { label: 'Below Average', color: A, width: 34 },
    { label: 'Average',       color: G, width: 34 },
    { label: 'Excellent',     color: P, width: 16 },
  ]
  // 7-zone ACSM (Very Poor → Excellent)
  const acsm7 = [
    { label: 'Very Poor',     color: R, width: 9 },
    { label: 'Poor',          color: O, width: 9 },
    { label: 'Below Average', color: A, width: 14 },
    { label: 'Average',       color: L, width: 36 },
    { label: 'Above Average', color: G, width: 14 },
    { label: 'Good',          color: B, width: 9 },
    { label: 'Excellent',     color: P, width: 9 },
  ]
  // 6-zone ACSM (Very Poor → Superior)
  const acsm6 = [
    { label: 'Very Poor',  color: R, width: 14 },
    { label: 'Poor',       color: O, width: 14 },
    { label: 'Fair',       color: A, width: 18 },
    { label: 'Good',       color: G, width: 18 },
    { label: 'Excellent',  color: B, width: 18 },
    { label: 'Superior',   color: P, width: 18 },
  ]
  // 5-zone CSEP (Needs Improvement → Excellent)
  const csep5 = [
    { label: 'Needs Improvement', color: R, width: 20 },
    { label: 'Fair',              color: O, width: 20 },
    { label: 'Good',              color: A, width: 20 },
    { label: 'Very Good',         color: G, width: 20 },
    { label: 'Excellent',         color: B, width: 20 },
  ]
  // 5-zone endurance (Poor → Excellent)
  const end5 = [
    { label: 'Poor',          color: R, width: 20 },
    { label: 'Below Average', color: O, width: 20 },
    { label: 'Average',       color: A, width: 20 },
    { label: 'Good',          color: G, width: 20 },
    { label: 'Excellent',     color: B, width: 20 },
  ]
  // 3-zone range (Below / Within / Above)
  const range3 = [
    { label: 'Below Normal Range',  color: R, width: 20 },
    { label: 'Within Normal Range', color: G, width: 60 },
    { label: 'Above Normal Range',  color: B, width: 20 },
  ]
  // ROM 2-zone
  const rom2 = [
    { label: 'Outside Normal Range', color: R, width: 30 },
    { label: 'Within Normal Range',  color: G, width: 70 },
  ]

  // ─ per-test zone config ─
  const configs = {
    restingHR: () => RESTING_HR_NORMS.zones.map((z, i) => ({
      label: z.label, color: rc(z.color), width: [8, 17, 34, 15, 26][i],
    })),

    restingBP: () => [
      { label: 'Normal',                  color: G,  width: 35 },
      { label: 'Elevated',                color: L,  width: 15 },
      { label: 'Stage 1 Hypertension',    color: A,  width: 20 },
      { label: 'Stage 2 Hypertension',    color: O,  width: 20 },
      { label: 'Hypertensive Crisis',     color: R,  width: 10 },
    ],

    bmi: () => [
      { label: 'Underweight', color: B, width: 12 },
      { label: 'Normal Weight', color: G, width: 25 },
      { label: 'Overweight',  color: A, width: 18 },
      { label: 'Obese I',     color: O, width: 18 },
      { label: 'Obese II',    color: R, width: 14 },
      { label: 'Obese III',   color: R, width: 13 },
    ],

    waistCirc: () => [
      { label: 'Low Risk',       color: G, width: 40 },
      { label: 'Increased Risk', color: A, width: 30 },
      { label: 'High Risk',      color: R, width: 30 },
    ],

    waistHipRatio: () => [
      { label: 'Low Risk',      color: G, width: 40 },
      { label: 'Moderate Risk', color: A, width: 30 },
      { label: 'High Risk',     color: R, width: 30 },
    ],

    bodyFatPct: () => [
      { label: 'Underfat',   color: B, width: 15 },
      { label: 'Healthy',    color: G, width: 35 },
      { label: 'Borderline', color: L, width: 15 },
      { label: 'Overfat',    color: A, width: 20 },
      { label: 'Obese',      color: R, width: 15 },
    ],

    spo2: () => [
      { label: 'Critically Low',              color: R, width: 20 },
      { label: 'Low (Clinically Significant)', color: O, width: 15 },
      { label: 'Borderline Low',              color: A, width: 15 },
      { label: 'Normal',                      color: G, width: 50 },
    ],

    vo2max: () => acsm6,

    sixMWT: () => [
      { label: 'Significantly Below Predicted', color: R, width: 20 },
      { label: 'Moderately Below Predicted',    color: A, width: 25 },
      { label: 'Slightly Below Predicted',      color: L, width: 25 },
      { label: 'At or Above Predicted',         color: G, width: 30 },
    ],

    twoMinStep:   () => range3,
    sitToStand30: () => range3,

    oneFiveMileRun: () => [
      { label: 'Very Poor',  color: R, width: 14 },
      { label: 'Poor',       color: O, width: 14 },
      { label: 'Fair',       color: A, width: 18 },
      { label: 'Good',       color: G, width: 18 },
      { label: 'Excellent',  color: B, width: 18 },
      { label: 'Superior',   color: P, width: 18 },
    ],

    cooper12min: () => acsm6,

    gripStrength:               () => pct5,
    sitToStand5x:               () => pct5,
    singleLegStanceOpen:        () => pct4,
    singleLegStanceClosed:      () => pct4,

    pushUp:      () => acsm7,
    stagedSitUp: () => acsm7,
    curlUp:      () => csep5,
    proneBridge: () => csep5,

    cervicalFlexorEndurance:     () => end5,
    cervicalExtensionEndurance:  () => end5,
    cervicalLateralFlexionEndurance: () => end5,
    bieringSorensen:             () => end5,
    hipAbductorStrength:         () => [
      { label: 'Poor',          color: R, width: 25 },
      { label: 'Below Average', color: A, width: 25 },
      { label: 'Average',       color: G, width: 25 },
      { label: 'Good',          color: B, width: 25 },
    ],

    ccft: () => [
      { label: 'Minimal',       color: R, width: 20 },
      { label: 'Mild',          color: O, width: 20 },
      { label: 'Moderate',      color: A, width: 20 },
      { label: 'Near Full',     color: G, width: 20 },
      { label: 'Full Activation', color: B, width: 20 },
    ],

    deadHang:      () => [
      { label: 'Beginner',     color: R, width: 20 },
      { label: 'Intermediate', color: O, width: 20 },
      { label: 'Good',         color: A, width: 20 },
      { label: 'Excellent',    color: G, width: 20 },
      { label: 'Elite',        color: B, width: 20 },
    ],
    isometricSquat: () => [
      { label: 'Beginner',     color: R, width: 20 },
      { label: 'Intermediate', color: O, width: 20 },
      { label: 'Good',         color: A, width: 20 },
      { label: 'Excellent',    color: G, width: 20 },
      { label: 'Elite',        color: B, width: 20 },
    ],

    sitAndReach: () => [
      { label: 'Poor',          color: R, width: 20 },
      { label: 'Fair',          color: O, width: 20 },
      { label: 'Average',       color: A, width: 20 },
      { label: 'Good',          color: G, width: 20 },
      { label: 'Excellent',     color: B, width: 20 },
    ],

    tug: () => [
      { label: 'At Risk for Falls', color: R, width: 25 },
      { label: 'Below Average',     color: A, width: 25 },
      { label: 'Average',           color: G, width: 25 },
      { label: 'Excellent',         color: B, width: 25 },
    ],

    bergBalance: () => [
      { label: 'High Fall Risk',     color: R, width: 36 },
      { label: 'Moderate Fall Risk', color: A, width: 36 },
      { label: 'Low Fall Risk',      color: G, width: 28 },
    ],

    sppb: () => [
      { label: 'Severely Limited', color: R, width: 25 },
      { label: 'Low Performance',  color: O, width: 25 },
      { label: 'Intermediate',     color: A, width: 25 },
      { label: 'High Performance', color: G, width: 25 },
    ],

    fourSquareStep: () => [
      { label: 'Low Fall Risk',      color: G, width: 35 },
      { label: 'Borderline',         color: A, width: 25 },
      { label: 'Increased Fall Risk', color: R, width: 40 },
    ],

    kneeToWall: () => [
      { label: 'Significantly Restricted', color: R, width: 25 },
      { label: 'Restricted',               color: A, width: 25 },
      { label: 'Functional',               color: G, width: 25 },
      { label: 'Excellent',                color: B, width: 25 },
    ],
  }

  // ROM tests share the same 2-zone config
  const ROM_IDS = [
    'cervicalFlex', 'cervicalExt', 'lumbarFlex', 'lumbarExt',
    'cervicalRot', 'cervicalLatFlex', 'thoracicRot', 'lumbarLatFlex',
    'shoulderFlex', 'shoulderAbd', 'shoulderER', 'shoulderIR', 'shoulderExt', 'shoulderHorizAdd',
    'elbowFlex', 'elbowExt', 'elbowPronation', 'elbowSupination',
    'wristFlex', 'wristExt', 'wristRadDev', 'wristUlnDev',
    'hipFlex', 'hipExt', 'hipAbd', 'hipAdd', 'hipIR', 'hipER',
    'kneeFlexROM', 'kneeExt',
    'ankleDorsi', 'anklePlantar', 'ankleInv', 'ankleEve',
    'subtalarInv', 'subtalarEve',
  ]
  if (ROM_IDS.includes(testId)) return { zones: rom2, activeCategory: cat, markerPct: null }

  const build = configs[testId]
  if (!build) return null

  return { zones: build(), activeCategory: cat, markerPct }
}

function rc(token) {
  const map = { 'zone-red': '#ef4444', 'zone-amber': '#f59e0b', 'zone-green': '#22c55e', 'zone-blue': '#3b82f6' }
  return map[token] ?? token
}
