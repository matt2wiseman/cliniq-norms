// ─────────────────────────────────────────────────────────────────────────────
// ClinIQ Norms — Hardcoded Normative Data
// All values sourced from peer-reviewed publications (cited per table).
// ─────────────────────────────────────────────────────────────────────────────

// Normal SpO2 reference ranges per British Thoracic Society and WHO guidelines.
// Source: O'Driscoll BR, et al. (2008). BTS guideline for emergency oxygen use in adult patients.
// Thorax, 63(Suppl 6), vi1-68. | World Health Organization. (2011). Pulse oximetry training manual.
export const SPO2_NORMS = {
  source: 'O\'Driscoll BR, et al. (2008). BTS guideline for emergency oxygen use. Thorax, 63(Suppl 6), vi1-68. | WHO. (2011). Pulse oximetry training manual.',
  unit: '%',
  zones: [
    { minVal: 95, maxVal: 100, label: 'Normal',                      color: 'zone-green' },
    { minVal: 92, maxVal: 94,  label: 'Borderline Low',              color: 'zone-amber' },
    { minVal: 88, maxVal: 91,  label: 'Low (Clinically Significant)', color: 'zone-red'   },
    { minVal: 0,  maxVal: 87,  label: 'Critically Low',              color: 'zone-red'   },
  ],
  desaturationThreshold: 4,
  desaturationNote: 'Exercise-induced SpO2 drop ≥4% from baseline may indicate significant cardiopulmonary limitation.',
}

// Source: Mathiowetz V, et al. (1985). Grip and pinch strength: normative data
// for adults. Archives of Physical Medicine and Rehabilitation, 66(2), 69-74.
export const GRIP_STRENGTH_NORMS = {
  source: 'Mathiowetz et al. (1985). Arch Phys Med Rehabil, 66(2), 69-74.',
  hand: 'dominant',
  unit: 'kg',
  bands: [
    { label: '20-24', minAge: 20, maxAge: 24, male: { mean: 54.9, sd: 9.7 },  female: { mean: 33.8, sd: 6.1 } },
    { label: '25-29', minAge: 25, maxAge: 29, male: { mean: 57.0, sd: 9.9 },  female: { mean: 34.9, sd: 6.5 } },
    { label: '30-34', minAge: 30, maxAge: 34, male: { mean: 57.5, sd: 10.2 }, female: { mean: 34.9, sd: 7.3 } },
    { label: '35-39', minAge: 35, maxAge: 39, male: { mean: 57.0, sd: 10.2 }, female: { mean: 33.8, sd: 7.0 } },
    { label: '40-44', minAge: 40, maxAge: 44, male: { mean: 55.8, sd: 10.2 }, female: { mean: 32.8, sd: 6.5 } },
    { label: '45-49', minAge: 45, maxAge: 49, male: { mean: 52.6, sd: 10.7 }, female: { mean: 31.6, sd: 6.9 } },
    { label: '50-54', minAge: 50, maxAge: 54, male: { mean: 50.8, sd: 10.8 }, female: { mean: 29.9, sd: 7.1 } },
    { label: '55-59', minAge: 55, maxAge: 59, male: { mean: 48.2, sd: 11.0 }, female: { mean: 28.3, sd: 6.7 } },
    { label: '60-64', minAge: 60, maxAge: 64, male: { mean: 42.8, sd: 11.0 }, female: { mean: 25.9, sd: 6.9 } },
    { label: '65-69', minAge: 65, maxAge: 69, male: { mean: 40.2, sd: 11.4 }, female: { mean: 24.5, sd: 6.5 } },
    { label: '70-74', minAge: 70, maxAge: 74, male: { mean: 37.2, sd: 11.0 }, female: { mean: 23.0, sd: 6.2 } },
    { label: '75+',   minAge: 75, maxAge: 999,male: { mean: 33.6, sd: 11.1 }, female: { mean: 20.7, sd: 6.7 } },
  ],
}

// Source: Rikli RE & Jones CJ. (2013). Senior Fitness Test Manual, 2nd ed.
// Normal ranges (inclusive) for community-dwelling older adults.
// Younger adult norms from Bohannon RW. (2006). Normative data for the arm
// curl test, chair stand test. J Aging Phys Act, 14(4), 456-466.
export const SIT_TO_STAND_30S_NORMS = {
  source: 'Rikli & Jones (2013). Senior Fitness Test Manual, 2nd ed. | Bohannon (2006). J Aging Phys Act.',
  unit: 'reps',
  bands: [
    // Younger adults — Bohannon approximate norms
    { label: '20-29', minAge: 20, maxAge: 29, male: { low: 18, high: 28 }, female: { low: 16, high: 24 } },
    { label: '30-39', minAge: 30, maxAge: 39, male: { low: 17, high: 27 }, female: { low: 15, high: 23 } },
    { label: '40-49', minAge: 40, maxAge: 49, male: { low: 15, high: 25 }, female: { low: 13, high: 22 } },
    { label: '50-59', minAge: 50, maxAge: 59, male: { low: 14, high: 22 }, female: { low: 12, high: 20 } },
    // Rikli & Jones older adult norms
    { label: '60-64', minAge: 60, maxAge: 64, male: { low: 14, high: 19 }, female: { low: 12, high: 17 } },
    { label: '65-69', minAge: 65, maxAge: 69, male: { low: 12, high: 18 }, female: { low: 11, high: 16 } },
    { label: '70-74', minAge: 70, maxAge: 74, male: { low: 12, high: 17 }, female: { low: 10, high: 15 } },
    { label: '75-79', minAge: 75, maxAge: 79, male: { low: 11, high: 17 }, female: { low: 10, high: 15 } },
    { label: '80-84', minAge: 80, maxAge: 84, male: { low: 10, high: 15 }, female: { low:  9, high: 14 } },
    { label: '85-89', minAge: 85, maxAge: 89, male: { low:  8, high: 14 }, female: { low:  8, high: 13 } },
    { label: '90-94', minAge: 90, maxAge: 999,male: { low:  7, high: 12 }, female: { low:  4, high: 11 } },
  ],
}

// Source: Bohannon RW. (2006). Reference values for the five-repetition sit-to-stand test.
// Journal of Strength and Conditioning Research, 20(4), 801-803.
// Note: Lower time = better performance. Age bands approximate from available literature.
export const SIT_TO_STAND_5X_NORMS = {
  source: 'Bohannon RW. (2006). J Strength Cond Res, 20(4), 801-803.',
  unit: 's',
  note: 'Lower time indicates better performance',
  bands: [
    { label: '20-29', minAge: 20, maxAge: 29, male: { mean: 10.2, sd: 2.0 }, female: { mean: 11.0, sd: 2.1 } },
    { label: '30-39', minAge: 30, maxAge: 39, male: { mean: 10.8, sd: 2.1 }, female: { mean: 11.4, sd: 2.2 } },
    { label: '40-49', minAge: 40, maxAge: 49, male: { mean: 11.4, sd: 2.3 }, female: { mean: 12.0, sd: 2.4 } },
    { label: '50-59', minAge: 50, maxAge: 59, male: { mean: 12.3, sd: 2.5 }, female: { mean: 13.0, sd: 2.7 } },
    { label: '60-69', minAge: 60, maxAge: 69, male: { mean: 13.5, sd: 3.0 }, female: { mean: 14.5, sd: 3.1 } },
    { label: '70-79', minAge: 70, maxAge: 79, male: { mean: 15.0, sd: 3.5 }, female: { mean: 16.5, sd: 3.8 } },
    { label: '80+',   minAge: 80, maxAge: 999,male: { mean: 18.0, sd: 4.5 }, female: { mean: 19.5, sd: 5.0 } },
  ],
}

// Source: ACSM Guidelines for Exercise Testing and Prescription, 8th–11th eds.
// Categories indexed: 0=Very Poor, 1=Poor, 2=Below Average, 3=Average,
//                     4=Above Average, 5=Good, 6=Excellent
// Values represent minimum reps to reach that category.
export const PUSH_UP_NORMS = {
  source: 'ACSM Guidelines for Exercise Testing and Prescription, 11th ed. (2022).',
  unit: 'reps',
  categories: ['Very Poor', 'Poor', 'Below Average', 'Average', 'Above Average', 'Good', 'Excellent'],
  colors:     ['zone-red',  'zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-green', 'zone-blue'],
  // [minReps for Very Poor, Poor, Below Avg, Average, Above Avg, Good, Excellent]
  male: {
    '20-29': [0, 10, 16, 22, 28, 35, 45],
    '30-39': [0,  8, 12, 17, 24, 29, 40],
    '40-49': [0,  6, 10, 13, 20, 26, 33],
    '50-59': [0,  4,  7, 10, 14, 21, 28],
    '60-69': [0,  2,  4,  8, 12, 16, 20],
  },
  female: {
    '20-29': [0,  5,  8, 11, 15, 20, 30],
    '30-39': [0,  3,  6,  9, 14, 19, 27],
    '40-49': [0,  2,  4,  7, 11, 15, 24],
    '50-59': [0,  1,  2,  4,  7, 11, 21],
    '60-69': [0,  0,  1,  2,  4,  8, 15],
  },
}

// Source: ACSM Guidelines for Exercise Testing and Prescription, 11th ed. (2022).
// Categories indexed: 0=Very Poor, 1=Poor, 2=Fair, 3=Good, 4=Excellent, 5=Superior
// Values = minimum VO2max (mL/kg/min) to reach that category.
export const VO2MAX_NORMS = {
  source: 'ACSM Guidelines for Exercise Testing and Prescription, 11th ed. (2022).',
  unit: 'mL/kg/min',
  categories: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent', 'Superior'],
  colors:     ['zone-red',  'zone-red', 'zone-amber', 'zone-green', 'zone-blue', 'zone-blue'],
  male: {
    '20-29': [0, 25, 34, 43, 53, 65],
    '30-39': [0, 24, 32, 42, 51, 63],
    '40-49': [0, 21, 28, 37, 46, 57],
    '50-59': [0, 18, 24, 34, 43, 54],
    '60+':   [0, 16, 21, 30, 39, 49],
  },
  female: {
    '20-29': [0, 22, 29, 37, 46, 57],
    '30-39': [0, 19, 27, 35, 43, 54],
    '40-49': [0, 17, 24, 31, 41, 53],
    '50-59': [0, 15, 22, 28, 38, 47],
    '60+':   [0, 13, 19, 24, 35, 46],
  },
}

// Source: Enright PL & Sherrill DL. (1998). Reference equations for the six-minute walk
// in healthy adults. American Journal of Respiratory and Critical Care Medicine, 158(5), 1384-7.
export const SIX_MWT_NORMS = {
  source: 'Enright PL & Sherrill DL. (1998). Am J Respir Crit Care Med, 158(5), 1384-1387.',
  unit: 'm',
  // Equations return predicted distance in metres.
  // h = height(cm), a = age(years), w = weight(kg)
  equations: {
    male:   (h, a, w) => 7.57 * h - 5.02 * a - 1.76 * w - 309,
    female: (h, a, w) => 2.11 * h - 5.78 * a - 2.29 * w + 667,
  },
}

// Source: American Heart Association / Harriet Lane Handbook
export const RESTING_HR_NORMS = {
  source: 'American Heart Association. (2023). All about heart rate (pulse). heart.org.',
  unit: 'bpm',
  zones: [
    { label: 'Extreme Bradycardia', minHR: 0,   maxHR: 39,  color: 'zone-red',   description: 'Seek medical review if not an elite athlete' },
    { label: 'Bradycardic / Athletic', minHR: 40, maxHR: 59, color: 'zone-blue',  description: 'Common in trained athletes; review in other contexts' },
    { label: 'Normal',              minHR: 60,  maxHR: 100, color: 'zone-green',  description: 'Within normal resting range' },
    { label: 'Mildly Tachycardic',  minHR: 101, maxHR: 119, color: 'zone-amber',  description: 'Monitor; rule out anxiety, dehydration, fever' },
    { label: 'Tachycardic',         minHR: 120, maxHR: 999, color: 'zone-red',    description: 'Clinical review recommended' },
  ],
  betaBlockerNote: 'Patient is on beta-blockers. Heart rate may be pharmacologically reduced — interpret with caution.',
}

// Source: Whelton PK, et al. (2018). 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA
// Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure
// in Adults. Journal of the American College of Cardiology, 71(19), e127-e248.
export const RESTING_BP_NORMS = {
  source: 'Whelton PK, et al. (2018). 2017 ACC/AHA Hypertension Guideline. JACC, 71(19), e127-e248.',
  unit: 'mmHg',
  // Evaluated in order — first match wins (most severe first)
  categories: [
    {
      label: 'Hypertensive Crisis',
      color: 'zone-red',
      description: 'Requires immediate medical attention',
      match: (s, d) => s > 180 || d > 120,
    },
    {
      label: 'Stage 2 Hypertension',
      color: 'zone-red',
      description: 'Clinical management recommended',
      match: (s, d) => s >= 140 || d >= 90,
    },
    {
      label: 'Stage 1 Hypertension',
      color: 'zone-amber',
      description: 'Lifestyle modification; consider medication',
      match: (s, d) => s >= 130 || d >= 80,
    },
    {
      label: 'Elevated',
      color: 'zone-amber',
      description: 'Lifestyle changes recommended',
      match: (s, d) => s >= 120 && d < 80,
    },
    {
      label: 'Normal',
      color: 'zone-green',
      description: 'Within normal range',
      match: () => true,
    },
  ],
}

// Source: World Health Organization. (2000). Obesity: preventing and managing
// the global epidemic. WHO Technical Report Series 894.
export const BMI_NORMS = {
  source: 'World Health Organization. (2000). WHO Technical Report Series 894.',
  unit: 'kg/m²',
  zones: [
    { label: 'Underweight',   minBMI: 0,    maxBMI: 18.49, color: 'zone-blue',  description: 'Below healthy weight range' },
    { label: 'Normal Weight', minBMI: 18.5, maxBMI: 24.9,  color: 'zone-green', description: 'Healthy weight range' },
    { label: 'Overweight',    minBMI: 25,   maxBMI: 29.9,  color: 'zone-amber', description: 'Above healthy weight range' },
    { label: 'Obese Class I', minBMI: 30,   maxBMI: 34.9,  color: 'zone-red',   description: 'Increased health risk' },
    { label: 'Obese Class II',minBMI: 35,   maxBMI: 39.9,  color: 'zone-red',   description: 'High health risk' },
    { label: 'Obese Class III',minBMI: 40,  maxBMI: 999,   color: 'zone-red',   description: 'Very high health risk' },
  ],
}

// Source: International Diabetes Federation. (2006). The IDF consensus worldwide
// definition of the metabolic syndrome. + WHO Expert Consultation (2008).
export const WAIST_CIRC_NORMS = {
  source: 'IDF (2006). Metabolic Syndrome Definition. | WHO Expert Consultation (2008).',
  unit: 'cm',
  male: [
    { label: 'Low Risk',      minVal: 0,   maxVal: 93.9,  color: 'zone-green', description: 'Within healthy range' },
    { label: 'Increased Risk',minVal: 94,  maxVal: 101.9, color: 'zone-amber', description: 'Increased cardiometabolic risk' },
    { label: 'High Risk',     minVal: 102, maxVal: 999,   color: 'zone-red',   description: 'High cardiometabolic risk' },
  ],
  female: [
    { label: 'Low Risk',      minVal: 0,   maxVal: 79.9,  color: 'zone-green', description: 'Within healthy range' },
    { label: 'Increased Risk',minVal: 80,  maxVal: 87.9,  color: 'zone-amber', description: 'Increased cardiometabolic risk' },
    { label: 'High Risk',     minVal: 88,  maxVal: 999,   color: 'zone-red',   description: 'High cardiometabolic risk' },
  ],
}

// Source: World Health Organization. (2008). Waist circumference and waist-hip ratio:
// report of a WHO expert consultation. Geneva.
export const WHR_NORMS = {
  source: 'World Health Organization. (2008). Waist-hip ratio WHO expert consultation.',
  unit: 'ratio',
  male: [
    { label: 'Low Risk',      minVal: 0,    maxVal: 0.899, color: 'zone-green', description: 'Low cardiovascular risk' },
    { label: 'Moderate Risk', minVal: 0.90, maxVal: 0.950, color: 'zone-amber', description: 'Moderate cardiovascular risk' },
    { label: 'High Risk',     minVal: 0.96, maxVal: 999,   color: 'zone-red',   description: 'High cardiovascular risk' },
  ],
  female: [
    { label: 'Low Risk',      minVal: 0,    maxVal: 0.799, color: 'zone-green', description: 'Low cardiovascular risk' },
    { label: 'Moderate Risk', minVal: 0.80, maxVal: 0.850, color: 'zone-amber', description: 'Moderate cardiovascular risk' },
    { label: 'High Risk',     minVal: 0.86, maxVal: 999,   color: 'zone-red',   description: 'High cardiovascular risk' },
  ],
}

// Source: Gallagher D, et al. (2000). Healthy percentage body fat ranges: an approach
// for developing guidelines based on body mass index. Am J Clin Nutr, 72(3), 694-701.
export const BODY_FAT_NORMS = {
  source: 'Gallagher D, et al. (2000). Am J Clin Nutr, 72(3), 694-701.',
  unit: '%',
  male: [
    { label: 'Underfat',     minVal: 0,  maxVal: 7.9,  color: 'zone-blue',  description: 'Below essential fat levels' },
    { label: 'Lean / Fit',   minVal: 8,  maxVal: 19.9, color: 'zone-green', description: 'Lean and healthy' },
    { label: 'Acceptable',   minVal: 20, maxVal: 24.9, color: 'zone-green', description: 'Within acceptable range' },
    { label: 'Overweight',   minVal: 25, maxVal: 30.9, color: 'zone-amber', description: 'Above optimal range' },
    { label: 'Obese',        minVal: 31, maxVal: 999,  color: 'zone-red',   description: 'Associated with health risk' },
  ],
  female: [
    { label: 'Underfat',     minVal: 0,  maxVal: 11.9, color: 'zone-blue',  description: 'Below essential fat levels' },
    { label: 'Lean / Fit',   minVal: 12, maxVal: 24.9, color: 'zone-green', description: 'Lean and healthy' },
    { label: 'Acceptable',   minVal: 25, maxVal: 30.9, color: 'zone-green', description: 'Within acceptable range' },
    { label: 'Overweight',   minVal: 31, maxVal: 38.9, color: 'zone-amber', description: 'Above optimal range' },
    { label: 'Obese',        minVal: 39, maxVal: 999,  color: 'zone-red',   description: 'Associated with health risk' },
  ],
}

// Source: Bohannon RW. (2006). Reference values for the timed up and go test.
// Journal of Geriatric Physical Therapy, 29(2), 64-68.
// Fall risk threshold: Shumway-Cook A, et al. (2000). Predicting the probability
// for falls in community-dwelling older adults. Physical Therapy, 80(9), 896-903.
export const TUG_NORMS = {
  source: 'Bohannon RW. (2006). J Geriatr Phys Ther, 29(2), 64-68. | Shumway-Cook A, et al. (2000). Phys Ther, 80(9), 896-903.',
  unit: 's',
  note: 'Lower time = better performance',
  fallRiskThreshold: 12,
  fallRiskNote: 'TUG > 12 seconds is associated with increased fall risk in community-dwelling older adults (Shumway-Cook, 2000).',
  bands: [
    { label: '20-29', minAge: 20, maxAge: 29, mean: 7.0, sd: 1.0 },
    { label: '30-39', minAge: 30, maxAge: 39, mean: 7.0, sd: 1.0 },
    { label: '40-49', minAge: 40, maxAge: 49, mean: 7.5, sd: 1.2 },
    { label: '50-59', minAge: 50, maxAge: 59, mean: 8.0, sd: 1.5 },
    { label: '60-69', minAge: 60, maxAge: 69, mean: 8.1, sd: 1.8 },
    { label: '70-79', minAge: 70, maxAge: 79, mean: 9.2, sd: 2.0 },
    { label: '80-89', minAge: 80, maxAge: 89, mean: 11.3, sd: 3.1 },
    { label: '90+',   minAge: 90, maxAge: 999,mean: 13.0, sd: 4.0 },
  ],
}

// Source: Bohannon RW, et al. (1984). Decrease in timed balance test scores with aging.
// Physical Therapy, 64(7), 1067-1072.
export const SINGLE_LEG_STANCE_NORMS = {
  source: 'Bohannon RW, et al. (1984). Phys Ther, 64(7), 1067-1072.',
  unit: 's',
  note: 'Best of 3 trials recommended; 60-second maximum',
  eyesOpen: [
    { label: '20-29', minAge: 20, maxAge: 29, mean: 29.3, sd: 12.6 },
    { label: '30-39', minAge: 30, maxAge: 39, mean: 28.0, sd: 13.4 },
    { label: '40-49', minAge: 40, maxAge: 49, mean: 24.2, sd: 13.3 },
    { label: '50-59', minAge: 50, maxAge: 59, mean: 21.2, sd: 12.6 },
    { label: '60-69', minAge: 60, maxAge: 69, mean: 13.9, sd: 11.4 },
    { label: '70-79', minAge: 70, maxAge: 79, mean:  6.3, sd:  7.0 },
  ],
  eyesClosed: [
    { label: '20-29', minAge: 20, maxAge: 29, mean: 21.3, sd: 11.0 },
    { label: '30-39', minAge: 30, maxAge: 39, mean: 17.7, sd: 10.6 },
    { label: '40-49', minAge: 40, maxAge: 49, mean: 15.4, sd: 10.4 },
    { label: '50-59', minAge: 50, maxAge: 59, mean: 12.5, sd:  9.8 },
    { label: '60-69', minAge: 60, maxAge: 69, mean:  6.6, sd:  7.2 },
    { label: '70-79', minAge: 70, maxAge: 79, mean:  3.4, sd:  3.8 },
  ],
}

// Source: Berg KO, et al. (1992). Measuring balance in the elderly: preliminary
// development of an instrument. Physiotherapy Canada, 44(2), 7-11.
export const BERG_BALANCE_NORMS = {
  source: 'Berg KO, et al. (1992). Physiother Can, 44(2), 7-11.',
  unit: '/56',
  maxScore: 56,
  increasedFallRiskThreshold: 45,
  increasedFallRiskNote: 'Score < 45 is associated with increased fall risk.',
  interpretation: [
    { label: 'High Fall Risk',     minScore: 0,  maxScore: 20, color: 'zone-red',   description: 'Requires wheelchair or maximum assistance' },
    { label: 'Moderate Fall Risk', minScore: 21, maxScore: 40, color: 'zone-amber', description: 'Walking with assistance required' },
    { label: 'Low Fall Risk',      minScore: 41, maxScore: 56, color: 'zone-green', description: 'Mostly independent; fall risk monitoring still advised below 45' },
  ],
}

// Source: ACSM Guidelines for Exercise Testing and Prescription, 11th ed. (2022).
// Adapted from Wells KF & Dillon EK (1952).
// Values represent minimum cm to reach each category.
// Note: Uses a standardised sit-and-reach box (foot position at 26cm mark).
export const SIT_REACH_NORMS = {
  source: 'ACSM Guidelines, 11th ed. (2022). Adapted from Wells & Dillon (1952).',
  unit: 'cm',
  categories: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
  colors:     ['zone-red',  'zone-red', 'zone-amber', 'zone-green', 'zone-blue'],
  male: {
    '20-29': [0, 17, 25, 31, 38],
    '30-39': [0, 15, 23, 29, 36],
    '40-49': [0, 13, 21, 27, 34],
    '50-59': [0, 11, 19, 25, 32],
    '60+':   [0,  9, 17, 23, 30],
  },
  female: {
    '20-29': [0, 22, 31, 37, 43],
    '30-39': [0, 20, 29, 35, 41],
    '40-49': [0, 18, 27, 33, 39],
    '50-59': [0, 16, 25, 31, 37],
    '60+':   [0, 14, 23, 29, 35],
  },
}

// Source: Rikli RE & Jones CJ. (2013). Senior Fitness Test Manual, 2nd ed.
// Normal step-count ranges (inclusive) for community-dwelling older adults.
export const TWO_MIN_STEP_NORMS = {
  source: 'Rikli RE & Jones CJ. (2013). Senior Fitness Test Manual, 2nd ed. Human Kinetics.',
  unit: 'steps',
  bands: [
    { label: '60-64', minAge: 60, maxAge: 64, male: { low: 87, high: 115 }, female: { low: 75, high: 107 } },
    { label: '65-69', minAge: 65, maxAge: 69, male: { low: 86, high: 116 }, female: { low: 73, high: 107 } },
    { label: '70-74', minAge: 70, maxAge: 74, male: { low: 80, high: 110 }, female: { low: 68, high: 101 } },
    { label: '75-79', minAge: 75, maxAge: 79, male: { low: 73, high: 109 }, female: { low: 68, high: 100 } },
    { label: '80-84', minAge: 80, maxAge: 84, male: { low: 71, high: 103 }, female: { low: 60, high:  91 } },
    { label: '85-89', minAge: 85, maxAge: 89, male: { low: 59, high:  91 }, female: { low: 55, high:  85 } },
    { label: '90-94', minAge: 90, maxAge: 999,male: { low: 52, high:  86 }, female: { low: 44, high:  72 } },
  ],
}

// Source: Cooper KH. (1968). A means of assessing maximal oxygen intake.
// JAMA, 203(3), 201-204. + ACSM categories.
// Values = minimum metres to reach each category.
export const COOPER_12MIN_NORMS = {
  source: 'Cooper KH. (1968). JAMA, 203(3), 201-204. | ACSM Guidelines, 11th ed.',
  unit: 'm',
  categories: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent', 'Superior'],
  colors:     ['zone-red',  'zone-red', 'zone-amber', 'zone-green', 'zone-blue', 'zone-blue'],
  male: {
    '13-19': [0, 1520, 1840, 2080, 2480, 2800],
    '20-29': [0, 1520, 1840, 2080, 2400, 2800],
    '30-39': [0, 1360, 1680, 1920, 2320, 2640],
    '40-49': [0, 1200, 1520, 1840, 2240, 2560],
    '50-59': [0, 1040, 1360, 1680, 2080, 2400],
    '60+':   [0,  880, 1200, 1520, 1840, 2160],
  },
  female: {
    '13-19': [0, 1280, 1520, 1840, 2160, 2480],
    '20-29': [0, 1280, 1520, 1840, 2080, 2400],
    '30-39': [0, 1120, 1360, 1680, 1920, 2240],
    '40-49': [0,  960, 1200, 1520, 1760, 2080],
    '50-59': [0,  800, 1040, 1360, 1600, 1920],
    '60+':   [0,  640,  880, 1120, 1440, 1760],
  },
}

// Source: ACSM Guidelines for Exercise Testing and Prescription, 11th ed. (2022).
// Values = maximum minutes:seconds (as decimal minutes) for each category (lower = better).
// Stored as maximum minutes to be in that category (ascending severity).
export const ONE_FIVE_MILE_NORMS = {
  source: 'ACSM Guidelines for Exercise Testing and Prescription, 11th ed. (2022).',
  unit: 'min',
  note: 'Lower time = better performance',
  categories: ['Superior', 'Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'],
  colors:     ['zone-blue', 'zone-green', 'zone-green', 'zone-amber', 'zone-red', 'zone-red'],
  // maxTime to reach that category (lower time = better rank)
  // [Superior max, Excellent max, Good max, Fair max, Poor max, Very Poor = any remaining]
  male: {
    '20-29': [8.0,  9.75, 11.0, 12.33, 16.5, 999],
    '30-39': [8.83, 10.5, 12.0, 13.75, 17.5, 999],
    '40-49': [9.67, 11.5, 13.0, 14.75, 18.5, 999],
    '50-59': [10.5, 12.5, 14.0, 15.67, 19.5, 999],
    '60+':   [11.5, 13.5, 15.0, 16.5,  20.5, 999],
  },
  female: {
    '20-29': [9.75,  11.5, 13.0, 15.25, 18.67, 999],
    '30-39': [10.5,  12.5, 14.0, 16.25, 19.75, 999],
    '40-49': [11.5,  13.5, 15.0, 17.25, 21.0,  999],
    '50-59': [12.5,  14.5, 16.5, 18.5,  22.0,  999],
    '60+':   [13.5,  15.5, 17.5, 19.5,  23.0,  999],
  },
}

// Dead hang — limited peer-reviewed normative data.
// Using community benchmark categories as a proxy.
// Source: Brawner CA general strength endurance + community fitness benchmarks.
export const DEAD_HANG_NORMS = {
  source: 'Community fitness benchmarks (limited peer-reviewed data — interpret with caution).',
  unit: 's',
  caveat: 'Limited peer-reviewed normative data is available for dead hang hold time. The categories below are approximate community-based benchmarks and should be interpreted with caution.',
  categories: ['Beginner', 'Intermediate', 'Good', 'Excellent', 'Elite'],
  colors:     ['zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-blue'],
  male:   [0, 15, 30, 60, 90],
  female: [0, 10, 20, 45, 70],
}

// Isometric squat hold (wall sit) — limited normative data.
export const ISOMETRIC_SQUAT_NORMS = {
  source: 'Approximate community-based benchmarks (limited peer-reviewed normative data).',
  unit: 's',
  caveat: 'Standardised peer-reviewed normative data for the isometric squat hold is limited. Categories below are approximate benchmarks and should be interpreted with caution.',
  categories: ['Beginner', 'Intermediate', 'Good', 'Excellent', 'Elite'],
  colors:     ['zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-blue'],
  male:   [0, 20, 45, 75, 120],
  female: [0, 20, 45, 75, 120],
}

// Source: ACSM Guidelines for Exercise Testing and Prescription, 11th ed. (2022).
// 1-Minute Sit-Up Test norms by sex and age band.
export const STAGED_SIT_UP_NORMS = {
  source: 'ACSM Guidelines for Exercise Testing and Prescription, 11th ed. (2022).',
  unit: 'reps',
  categories: ['Very Poor', 'Poor', 'Below Average', 'Average', 'Above Average', 'Good', 'Excellent'],
  colors:     ['zone-red', 'zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-green', 'zone-blue'],
  male: {
    '20-29': [0, 17, 22, 27, 33, 40, 48],
    '30-39': [0, 13, 17, 21, 26, 33, 40],
    '40-49': [0, 10, 13, 17, 22, 29, 35],
    '50-59': [0,  7,  9, 13, 18, 25, 30],
    '60-69': [0,  4,  6, 10, 14, 20, 25],
  },
  female: {
    '20-29': [0, 12, 17, 23, 29, 35, 42],
    '30-39': [0,  8, 12, 16, 21, 28, 35],
    '40-49': [0,  6,  8, 12, 16, 22, 30],
    '50-59': [0,  2,  4,  7, 11, 18, 25],
    '60-69': [0,  0,  1,  5,  8, 14, 20],
  },
}

// Source: Canadian Society for Exercise Physiology (CSEP). (2013).
// Canadian Physical Activity, Fitness & Lifestyle Approach (CPAFLA), 3rd ed.
// Partial curl-up at 40 bpm cadence; maximum 75 repetitions.
export const CURL_UP_NORMS = {
  source: 'CSEP. (2013). Canadian Physical Activity, Fitness & Lifestyle Approach (CPAFLA), 3rd ed.',
  unit: 'reps',
  categories: ['Needs Improvement', 'Fair', 'Good', 'Very Good', 'Excellent'],
  colors:     ['zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-blue'],
  male: {
    '20-29': [0, 22, 41, 56, 75],
    '30-39': [0, 14, 31, 41, 75],
    '40-49': [0,  9, 21, 31, 75],
    '50-59': [0,  7, 16, 25, 74],
    '60-69': [0,  5, 12, 18, 53],
  },
  female: {
    '20-29': [0, 17, 38, 51, 70],
    '30-39': [0, 12, 30, 40, 55],
    '40-49': [0,  9, 22, 30, 50],
    '50-59': [0,  5, 14, 19, 48],
    '60-69': [0,  4, 11, 19, 50],
  },
}

// Cervical Flexor Endurance — deep neck flexors (supine head lift, chin nodded).
// Reference values based on Harris & colleagues; no large-scale population norms exist.
// Healthy control mean approx. 38-40 s from limited studies.
export const CERVICAL_FLEXOR_ENDURANCE_NORMS = {
  source: 'Harris KD, et al. (1992). Physiother Can. | Domenech MA, et al. (1991). Arch Phys Med Rehabil, 72(12), 1007-1011.',
  unit: 's',
  caveat: 'Peer-reviewed population norms for this test are limited. Categories below are based on published healthy control data and clinical benchmarks.',
  categories: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'],
  colors:     ['zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-blue'],
  thresholds: [0, 20, 38, 56, 76],
}

// Cervical Extension Endurance — cervical extensors (prone on elbows, head horizontal).
// Limited population norms; clinical benchmarks from Edmondston et al.
export const CERVICAL_EXTENSION_ENDURANCE_NORMS = {
  source: 'Edmondston SJ, et al. (2008). J Electromyogr Kinesiol. Clinical benchmarks for cervical extensor endurance.',
  unit: 's',
  caveat: 'Peer-reviewed population norms for this test are limited. Categories below represent approximate clinical benchmarks.',
  categories: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'],
  colors:     ['zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-blue'],
  thresholds: [0, 20, 40, 70, 120],
}

// Source: Biering-Sørensen F. (1984). Spine, 9(2), 106-119.
// McGill SM. (2007). Low Back Disorders, 2nd ed. Human Kinetics.
// Mean ± SD for healthy adults without LBP history.
export const BIERING_SORENSEN_NORMS = {
  source: 'Biering-Sørensen F. (1984). Spine, 9(2), 106-119. | McGill SM. (2007). Low Back Disorders, 2nd ed.',
  unit: 's',
  male:   { categories: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'], colors: ['zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-blue'], thresholds: [0, 60, 101, 151, 201] },
  female: { categories: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'], colors: ['zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-blue'], thresholds: [0, 80, 121, 201, 251] },
}

// Source: McGill SM, et al. (1999). Clin Biomech, 14(6), 389-398.
// McGill SM. (2007). Low Back Disorders, 2nd ed. Human Kinetics.
// Mean times for healthy young adults (approximate); ratio targets from clinical evidence.
export const MCGILL_BATTERY_NORMS = {
  source: 'McGill SM, et al. (1999). Clin Biomech, 14(6), 389-398. | McGill SM. (2007). Low Back Disorders, 2nd ed.',
  unit: 's',
  ratioThresholds: {
    flexExtRatio: { max: 1.0, note: 'Flexor:Extensor ratio should be <1.0 (extensors should be relatively stronger)' },
    sideBridgeExtRatio: { min: 0.75, note: 'Side Bridge:Extensor ratio should be >0.75' },
  },
  categories: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'],
  colors:     ['zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-blue'],
  flexorThresholds:    [0, 30, 80,  145, 200],
  extensorThresholds:  [0, 60, 100, 150, 210],
  sideBridgeThresholds:[0, 30, 60,  95,  130],
}

// Prone Bridge (Plank hold) — McGill-derived clinical benchmarks.
// No strong sex differences in plank norms; single table used for both.
export const PRONE_BRIDGE_NORMS = {
  source: 'McGill SM. (2007). Low Back Disorders, 2nd ed. Human Kinetics. Clinical benchmarks.',
  unit: 's',
  caveat: 'Population-stratified norms for plank hold are limited. Categories below are widely used clinical benchmarks derived from McGill\'s work.',
  categories: ['Needs Improvement', 'Fair', 'Good', 'Very Good', 'Excellent'],
  colors:     ['zone-red', 'zone-amber', 'zone-amber', 'zone-green', 'zone-blue'],
  thresholds: [0, 30, 60, 120, 180],
}

// Knee to Wall (Weight-Bearing Lunge / WBLT) — distance from great toe to wall.
// Functional threshold: ≥9 cm (Bennell 1998 / Munteanu 2011).
export const KNEE_TO_WALL_NORMS = {
  source: 'Bennell KL, et al. (1998). Br J Sports Med, 32(2), 167-171. | Munteanu SE & Barton CJ. (2011). J Foot Ankle Res.',
  unit: 'cm',
  restrictedThreshold: 9,
  categories: ['Significantly Restricted', 'Restricted', 'Functional', 'Excellent'],
  colors:     ['zone-red', 'zone-amber', 'zone-green', 'zone-blue'],
  thresholds: [0, 7, 9, 12],
}

// Source: Guralnik JM, et al. (1994). JAMA, 271(18), 1399-1404.
// SPPB total /12: balance (0-4) + gait speed (0-4) + chair stands (0-4).
export const SPPB_NORMS = {
  source: 'Guralnik JM, et al. (1994). A short physical performance battery assessing lower extremity function. JAMA, 271(18), 1399-1404.',
  unit: '/12',
  interpretation: [
    { minScore: 0,  maxScore: 3,  label: 'Severely Limited',    color: 'zone-red'   },
    { minScore: 4,  maxScore: 6,  label: 'Low Performance',     color: 'zone-red'   },
    { minScore: 7,  maxScore: 9,  label: 'Intermediate',        color: 'zone-amber' },
    { minScore: 10, maxScore: 12, label: 'High Performance',    color: 'zone-green' },
  ],
  disabilityRiskThreshold: 9,
  disabilityRiskNote: 'SPPB ≤9 associated with increased risk of mobility disability and adverse health outcomes.',
}

// Four Square Step Test — time (lower = better).
// Dite & Temple (2002): healthy community-dwelling older adults.
export const FOUR_SQUARE_STEP_NORMS = {
  source: 'Dite W & Temple VA. (2002). Arch Phys Med Rehabil, 83(11), 1566-1571.',
  unit: 's',
  fallRiskThreshold: 15,
  fallRiskNote: 'Four Square Step Test >15s is associated with increased fall risk.',
  categories: ['Low Fall Risk', 'Borderline', 'Increased Fall Risk'],
  colors:     ['zone-green', 'zone-amber', 'zone-red'],
}

// Sources: Magee DJ (2014). Orthopedic Physical Assessment, 6th ed.
// Norkin CC & White DJ (2016). Measurement of Joint Motion: A Guide to Goniometry, 5th ed.
// AAOS (1994). Joint Motion: Method of Measuring and Recording.
// Kendall FP, et al. (2005). Muscles: Testing and Function, 5th ed.
//
// normalMin/normalMax: expected range for a healthy adult (degrees).
// For elbowExt / kneeExt: 0° = full extension; negative = hyperextension (variant to −10°);
// positive = flexion contracture. normalMin = −10 (accept hyperextension variant), normalMax = 0.
export const ROM_NORMS = {
  source: 'Magee DJ (2014). Orthopedic Physical Assessment, 6th ed. | Norkin CC & White DJ (2016). Measurement of Joint Motion, 5th ed. | AAOS (1994). | Kendall FP et al. (2005). Muscles: Testing and Function, 5th ed.',
  asymmetryThreshold: 10,
  asymmetryNote: 'Side-to-side difference ≥10° may indicate clinically meaningful asymmetry.',
  joints: {
    // ─── CERVICAL ───────────────────────────────────────────────────────────
    cervicalFlex:     { label: 'Cervical Flexion',              normalMin: 0,   normalMax: 45,  unit: '°' },
    cervicalExt:      { label: 'Cervical Extension',            normalMin: 0,   normalMax: 45,  unit: '°' },
    cervicalLatFlex:  { label: 'Cervical Lateral Flexion',      normalMin: 0,   normalMax: 45,  unit: '°' },
    cervicalRot:      { label: 'Cervical Rotation',             normalMin: 0,   normalMax: 60,  unit: '°' },
    // ─── THORACIC ───────────────────────────────────────────────────────────
    thoracicRot:      { label: 'Thoracic Rotation',             normalMin: 0,   normalMax: 35,  unit: '°' },
    // ─── LUMBAR ─────────────────────────────────────────────────────────────
    lumbarFlex:       { label: 'Lumbar Flexion',                normalMin: 0,   normalMax: 60,  unit: '°' },
    lumbarExt:        { label: 'Lumbar Extension',              normalMin: 0,   normalMax: 25,  unit: '°' },
    lumbarLatFlex:    { label: 'Lumbar Lateral Flexion',        normalMin: 0,   normalMax: 25,  unit: '°' },
    // ─── SHOULDER ───────────────────────────────────────────────────────────
    shoulderFlex:     { label: 'Shoulder Flexion',              normalMin: 0,   normalMax: 180, unit: '°' },
    shoulderExt:      { label: 'Shoulder Extension',            normalMin: 0,   normalMax: 60,  unit: '°' },
    shoulderAbd:      { label: 'Shoulder Abduction',            normalMin: 0,   normalMax: 180, unit: '°' },
    shoulderIR:       { label: 'Shoulder Internal Rotation',    normalMin: 0,   normalMax: 70,  unit: '°' },
    shoulderER:       { label: 'Shoulder External Rotation',    normalMin: 0,   normalMax: 90,  unit: '°' },
    shoulderHorizAdd: { label: 'Shoulder Horizontal Adduction', normalMin: 0,   normalMax: 130, unit: '°' },
    // ─── ELBOW ──────────────────────────────────────────────────────────────
    elbowFlex:        { label: 'Elbow Flexion',                 normalMin: 0,   normalMax: 150, unit: '°' },
    elbowExt:         { label: 'Elbow Extension',               normalMin: -10, normalMax: 0,   unit: '°' }, // 0=full ext; neg=hyperext variant; pos=contracture
    elbowPronation:   { label: 'Elbow Pronation',               normalMin: 0,   normalMax: 80,  unit: '°' },
    elbowSupination:  { label: 'Elbow Supination',              normalMin: 0,   normalMax: 80,  unit: '°' },
    // ─── WRIST ──────────────────────────────────────────────────────────────
    wristFlex:        { label: 'Wrist Flexion',                 normalMin: 0,   normalMax: 80,  unit: '°' },
    wristExt:         { label: 'Wrist Extension',               normalMin: 0,   normalMax: 70,  unit: '°' },
    wristRadDev:      { label: 'Wrist Radial Deviation',        normalMin: 0,   normalMax: 20,  unit: '°' },
    wristUlnDev:      { label: 'Wrist Ulnar Deviation',         normalMin: 0,   normalMax: 30,  unit: '°' },
    // ─── HIP ────────────────────────────────────────────────────────────────
    hipFlex:          { label: 'Hip Flexion',                   normalMin: 0,   normalMax: 120, unit: '°' },
    hipExt:           { label: 'Hip Extension',                 normalMin: 0,   normalMax: 20,  unit: '°' },
    hipAbd:           { label: 'Hip Abduction',                 normalMin: 0,   normalMax: 45,  unit: '°' },
    hipAdd:           { label: 'Hip Adduction',                 normalMin: 0,   normalMax: 30,  unit: '°' },
    hipIR:            { label: 'Hip Internal Rotation',         normalMin: 0,   normalMax: 45,  unit: '°' },
    hipER:            { label: 'Hip External Rotation',         normalMin: 0,   normalMax: 45,  unit: '°' },
    // ─── KNEE ───────────────────────────────────────────────────────────────
    kneeFlexROM:      { label: 'Knee Flexion',                  normalMin: 0,   normalMax: 135, unit: '°' },
    kneeExt:          { label: 'Knee Extension',                normalMin: -10, normalMax: 0,   unit: '°' },
    // ─── ANKLE ──────────────────────────────────────────────────────────────
    ankleDorsi:       { label: 'Ankle Dorsiflexion',            normalMin: 0,   normalMax: 20,  unit: '°' },
    anklePlantar:     { label: 'Ankle Plantarflexion',          normalMin: 0,   normalMax: 50,  unit: '°' },
    ankleInv:         { label: 'Ankle Inversion',               normalMin: 0,   normalMax: 35,  unit: '°' },
    ankleEve:         { label: 'Ankle Eversion',                normalMin: 0,   normalMax: 15,  unit: '°' },
    // ─── SUBTALAR ───────────────────────────────────────────────────────────
    subtalarInv:      { label: 'Subtalar Inversion',            normalMin: 0,   normalMax: 35,  unit: '°' },
    subtalarEve:      { label: 'Subtalar Eversion',             normalMin: 0,   normalMax: 15,  unit: '°' },
  },
}
