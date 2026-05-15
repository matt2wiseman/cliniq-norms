import { useState, useMemo } from 'react'
import { TESTS, CATEGORIES, ROM_TEST_IDS, getTestById } from '../../data/tests.js'
import { calcBMI } from '../../utils/calculations.js'
import { scoreTest, scoreBMI, scoreRestingBP, scoreGripStrength } from '../../utils/scoring.js'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'

function formatDate() {
  return new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })
}

function sexLabel(sex) {
  return sex === 'male' ? 'Male' : sex === 'female' ? 'Female' : 'Not specified'
}

function generateClinicalNote(demographics, selectedTests, results) {
  const { age, sex, height, weight, smoker, betablockers } = demographics
  const bmi = calcBMI(height, weight)
  const bmiScore = bmi ? scoreBMI(bmi) : null

  const lines = []
  lines.push('CLINICAL ASSESSMENT REPORT')
  lines.push(`Generated: ${formatDate()}`)
  lines.push('─'.repeat(50))
  lines.push('')
  lines.push('PATIENT DEMOGRAPHICS')
  lines.push(`Age: ${age} years  |  Sex: ${sexLabel(sex)}  |  Height: ${height} cm  |  Weight: ${weight} kg`)
  if (bmi) lines.push(`BMI: ${bmi} kg/m²  (${bmiScore?.category ?? '—'})`)
  lines.push(`Smoker: ${smoker ? 'Yes' : 'No'}  |  Beta-blockers: ${betablockers ? 'Yes' : 'No'}`)
  lines.push('')

  const flags = []

  lines.push('ASSESSMENT RESULTS')
  lines.push('')

  for (const cat of CATEGORIES) {
    const catTestIds = []
    if (cat.id === 'bodyComposition' && bmi) catTestIds.push('bmi')
    for (const test of TESTS) {
      if (test.category === cat.id && test.inputType !== 'auto' && selectedTests.has(test.id)) {
        catTestIds.push(test.id)
      }
    }
    if (catTestIds.length === 0) continue

    lines.push(cat.label.toUpperCase())

    for (const testId of catTestIds) {
      const test = getTestById(testId)
      if (!test) continue

      if (testId === 'bmi') {
        const line = `  BMI: ${bmi} kg/m²  — ${bmiScore?.category ?? '—'}`
        lines.push(line)
        if (bmiScore?.category && !['Normal Weight'].includes(bmiScore.category)) {
          flags.push(`[!] BMI: ${bmiScore.category}`)
        }
        continue
      }

      const result = results[testId]
      if (!result) { lines.push(`  ${test.label}: Not entered`); continue }

      // Notes-only tests
      if (test.inputType === 'notes') {
        if (result.notes) lines.push(`  ${test.label}: ${result.notes}`)
        else lines.push(`  ${test.label}: (no notes recorded)`)
        continue
      }

      let scoreResult = null
      let valueStr = ''
      let categoryStr = ''

      if (test.inputType === 'bp') {
        if (result.systolic && result.diastolic) {
          scoreResult = scoreRestingBP(result.systolic, result.diastolic)
          valueStr = `${result.systolic}/${result.diastolic} mmHg`
        }
      } else if (test.inputType === 'whr') {
        if (result.waist && result.hip) {
          const whr = (result.waist / result.hip).toFixed(2)
          scoreResult = scoreTest(testId, { ...result, value: whr }, demographics)
          valueStr = `WHR ${whr} (waist ${result.waist} cm, hip ${result.hip} cm)`
        }
      } else if (test.inputType === 'bilateral') {
        const parts = []
        if (result.left != null) parts.push(`L: ${result.left}${test.unit ? ` ${test.unit}` : ''}`)
        if (result.right != null) parts.push(`R: ${result.right}${test.unit ? ` ${test.unit}` : ''}`)
        valueStr = parts.join('  /  ')
        scoreResult = scoreTest(testId, result, demographics)
      } else if (test.inputType === 'berg') {
        const total = result.value ?? (result.items ?? []).reduce((s, v) => s + (v ?? 0), 0)
        valueStr = `${total}/56`
        scoreResult = scoreTest(testId, { ...result, value: total }, demographics)
      } else if (test.inputType === 'sppb') {
        const { balanceScore, gaitScore, chairStandScore } = result
        const parts = []
        if (balanceScore != null) parts.push(`Balance: ${balanceScore}/4`)
        if (gaitScore != null) parts.push(`Gait: ${gaitScore}/4`)
        if (chairStandScore != null) parts.push(`Chair stand: ${chairStandScore}/4`)
        const total = [balanceScore, gaitScore, chairStandScore].every(v => v != null)
          ? balanceScore + gaitScore + chairStandScore : null
        valueStr = total != null ? `${total}/12 (${parts.join(', ')})` : parts.join(', ')
        if (total != null) scoreResult = scoreTest(testId, result, demographics)
      } else if (test.inputType === 'ccft') {
        valueStr = result.achievedLevel ? `${result.achievedLevel} mmHg` : 'Not recorded'
        if (result.notes) valueStr += ` — Notes: ${result.notes}`
        scoreResult = result.achievedLevel ? scoreTest(testId, result, demographics) : null
      } else if (test.inputType === 'mcGillBattery') {
        const { flexor, extensor, sideBridgeLeft, sideBridgeRight } = result
        const parts = []
        if (flexor != null) parts.push(`Flex: ${flexor}s`)
        if (extensor != null) parts.push(`Ext: ${extensor}s`)
        if (sideBridgeLeft != null) parts.push(`SB-L: ${sideBridgeLeft}s`)
        if (sideBridgeRight != null) parts.push(`SB-R: ${sideBridgeRight}s`)
        valueStr = parts.join('  /  ')
        scoreResult = scoreTest(testId, result, demographics)
        if (scoreResult?.flags?.length) {
          scoreResult.flags.forEach(f => flags.push(`[!] ${test.label}: ${f}`))
        }
        // Build ratio lines for categoryStr
        if (flexor && extensor && extensor > 0) {
          const fe = (flexor / extensor).toFixed(2)
          categoryStr += `Flex:Ext=${fe}${parseFloat(fe) > 1.0 ? ' (⚑>1.0)' : ''}`
        }
        if (sideBridgeLeft && sideBridgeRight && extensor && extensor > 0) {
          const sb = ((sideBridgeLeft + sideBridgeRight) / 2 / extensor).toFixed(2)
          categoryStr += (categoryStr ? ', ' : '') + `SB:Ext=${sb}${parseFloat(sb) < 0.75 ? ' (⚑<0.75)' : ''}`
        }
        lines.push(`  ${test.label}: ${valueStr}${categoryStr ? '  — ' + categoryStr : ''}`)
        continue
      } else if (test.inputType === 'singleLegSquat') {
        const parts = []
        if (result.leftResult) {
          const faults = result.leftFaults?.length ? ` (${result.leftFaults.join(', ')})` : ''
          parts.push(`L: ${result.leftResult}${faults}`)
        }
        if (result.rightResult) {
          const faults = result.rightFaults?.length ? ` (${result.rightFaults.join(', ')})` : ''
          parts.push(`R: ${result.rightResult}${faults}`)
        }
        valueStr = parts.join('  /  ')
        if (result.notes) valueStr += ` — Notes: ${result.notes}`
        scoreResult = scoreTest(testId, result, demographics)
      } else if (test.inputType === 'erirRatio') {
        scoreResult = scoreTest(testId, result, demographics)
        const parts = []
        if (result.leftER != null && result.leftIR != null && result.leftIR > 0) {
          const r = (result.leftER / result.leftIR).toFixed(2)
          parts.push(`L ratio: ${r} (ER ${result.leftER}kg / IR ${result.leftIR}kg)`)
        }
        if (result.rightER != null && result.rightIR != null && result.rightIR > 0) {
          const r = (result.rightER / result.rightIR).toFixed(2)
          parts.push(`R ratio: ${r} (ER ${result.rightER}kg / IR ${result.rightIR}kg)`)
        }
        valueStr = parts.join('  /  ')
        if (scoreResult?.flags?.length) scoreResult.flags.forEach(f => flags.push(`[!] ${test.label}: ${f}`))
        const lCat = scoreResult?.left?.category, rCat = scoreResult?.right?.category
        categoryStr = [lCat && `L: ${lCat}`, rCat && `R: ${rCat}`].filter(Boolean).join(' / ')
        lines.push(`  ${test.label}: ${valueStr}${categoryStr ? '  — ' + categoryStr : ''}`)
        continue
      } else if (test.inputType === 'kneeToWall') {
        const unit = result.unit ?? 'cm'
        const parts = []
        if (result.left != null) parts.push(`L: ${result.left}${unit}`)
        if (result.right != null) parts.push(`R: ${result.right}${unit}`)
        valueStr = parts.join('  /  ')
        scoreResult = scoreTest(testId, result, demographics)
      } else if (test.inputType === 'spo2') {
        if (result.resting != null) {
          valueStr = `${result.resting}%`
          if (result.postExercise != null) valueStr += ` (post-exercise: ${result.postExercise}%)`
          if (result.supplementalO2) {
            const flowStr = result.flowRate ? ` at ${result.flowRate} L/min` : ''
            valueStr += ` [supplemental O₂${flowStr}]`
          }
          scoreResult = scoreTest(testId, result, demographics)
        }
      } else {
        valueStr = `${result.value}${test.unit ? ` ${test.unit}` : ''}`
        scoreResult = scoreTest(testId, result, demographics)
      }

      if (scoreResult) {
        if (scoreResult.left !== undefined || scoreResult.right !== undefined) {
          const lCat = scoreResult.left?.category
          const rCat = scoreResult.right?.category
          categoryStr = [lCat && `L: ${lCat}`, rCat && `R: ${rCat}`].filter(Boolean).join(' / ')
          const allFlags = [...(scoreResult.left?.flags ?? []), ...(scoreResult.right?.flags ?? [])]
          const uniqueFlags = [...new Set(allFlags)]
          uniqueFlags.forEach(f => flags.push(`[!] ${test.label}: ${f}`))
        } else if (!scoreResult.insufficient) {
          categoryStr = scoreResult.category ?? ''
          if (scoreResult.percentile != null) categoryStr += ` (${scoreResult.percentile}th percentile)`
          if (scoreResult.predicted != null) categoryStr += ` — Predicted: ${scoreResult.predicted} m (${scoreResult.pctPredicted}% of predicted)`
          scoreResult.flags?.forEach(f => flags.push(`[!] ${test.label}: ${f}`))
        } else {
          categoryStr = `Insufficient data: ${scoreResult.insufficientReason}`
        }
      }

      lines.push(`  ${test.label}: ${valueStr}${categoryStr ? '  — ' + categoryStr : ''}`)
    }
    lines.push('')
  }

  if (flags.length > 0) {
    lines.push('FLAGS FOR CLINICAL ATTENTION')
    flags.forEach(f => lines.push(`  ${f}`))
    lines.push('')
  }

  if (betablockers) {
    lines.push('CLINICAL NOTES')
    lines.push('  [i] Patient is on beta-blockers. Resting heart rate interpretation may be modified.')
    lines.push('')
  }

  lines.push('─'.repeat(50))
  lines.push('DISCLAIMER')
  lines.push('Generated by ClinIQ Norms. Results reflect comparison against published')
  lines.push('normative data only. Clinical interpretation by a qualified practitioner')
  lines.push('is required. This output does not constitute a clinical diagnosis.')

  return lines.join('\n')
}

function generatePatientSummary(demographics, selectedTests, results) {
  const { age, sex, weight, height, smoker } = demographics
  const bmi = calcBMI(height, weight)
  const bmiScore = bmi ? scoreBMI(bmi) : null

  const lines = []
  lines.push('YOUR HEALTH & FITNESS ASSESSMENT SUMMARY')
  lines.push(formatDate())
  lines.push('')
  lines.push('ABOUT THIS REPORT')
  lines.push('This summary has been prepared by your healthcare provider to explain your')
  lines.push('fitness assessment results in plain language.')
  lines.push('')

  const catSections = {
    cardiovascular: 'HEART & CARDIORESPIRATORY FITNESS',
    bodyComposition: 'BODY COMPOSITION',
    strength: 'STRENGTH',
    flexibility: 'FLEXIBILITY & JOINT MOBILITY',
    balance: 'BALANCE & MOBILITY',
    neurological: 'NEUROLOGICAL',
  }

  const friendlyCategories = {
    'Excellent': 'excellent for your age and sex',
    'Superior': 'outstanding for your age and sex',
    'Above Average': 'above average for your age and sex',
    'Good': 'good for your age and sex',
    'Average': 'average for your age and sex',
    'Within Normal Range': 'within the normal range',
    'Below Average': 'below the average for your age and sex',
    'Poor': 'below average — some room for improvement',
    'Very Poor': 'below the typical range — consider discussing this with your clinician',
    'Fair': 'fair — some room for improvement',
    'Normal': 'within the normal range',
    'Normal Weight': 'within a healthy range',
    'Overweight': 'slightly above the healthy range',
    'Low Risk': 'within a healthy range',
  }

  for (const cat of CATEGORIES) {
    const catTestIds = []
    if (cat.id === 'bodyComposition' && bmi) catTestIds.push('bmi')
    for (const test of TESTS) {
      if (test.category === cat.id && test.inputType !== 'auto' && selectedTests.has(test.id)) {
        catTestIds.push(test.id)
      }
    }
    if (catTestIds.length === 0) continue

    lines.push(catSections[cat.id] ?? cat.label.toUpperCase())

    for (const testId of catTestIds) {
      const test = getTestById(testId)
      if (!test) continue

      if (testId === 'bmi') {
        const friendly = friendlyCategories[bmiScore?.category] ?? bmiScore?.category
        lines.push(`Your body mass index (BMI) is ${bmi} kg/m², which is ${friendly}.`)
        continue
      }

      const result = results[testId]
      if (!result) continue

      if (test.inputType === 'notes') {
        if (result.notes) lines.push(`${test.label}: ${result.notes}`)
        continue
      }

      const scoreResult = scoreTest(testId, result, demographics)
      if (!scoreResult || scoreResult.insufficient) continue

      let sentence = ''
      const cat_ = scoreResult.left?.category ?? scoreResult.category
      const friendly = friendlyCategories[cat_] ?? cat_

      if (test.inputType === 'bp') {
        if (result.systolic && result.diastolic) {
          sentence = `Your blood pressure reading of ${result.systolic}/${result.diastolic} mmHg is classified as "${scoreResult.category}".`
          if (scoreResult.category === 'Normal') sentence += ' This is an excellent result.'
          else if (scoreResult.category === 'Elevated' || scoreResult.category === 'Stage 1 Hypertension') sentence += ' This is slightly above the ideal range and worth monitoring with your healthcare provider.'
          else if (scoreResult.category?.includes('Stage 2') || scoreResult.category?.includes('Crisis')) sentence += ' Please discuss this with your doctor as soon as possible.'
        }
      } else if (test.inputType === 'spo2') {
        if (result.resting != null) {
          sentence = `Your oxygen saturation (SpO₂) at rest is ${result.resting}%, which is classified as "${scoreResult.category}".`
          if (result.postExercise != null) sentence += ` Post-exercise SpO₂: ${result.postExercise}%.`
          if (result.supplementalO2) sentence += ` Note: measured on supplemental oxygen.`
        }
      } else if (test.inputType === 'bilateral') {
        const parts = []
        if (result.left != null) parts.push(`left: ${result.left} ${test.unit ?? ''}`)
        if (result.right != null) parts.push(`right: ${result.right} ${test.unit ?? ''}`)
        sentence = `Your ${test.label.toLowerCase()} result (${parts.join(', ')}) is ${friendly}.`
      } else if (scoreResult.predicted != null) {
        sentence = `Your ${test.label} result of ${result.value} m compares to a predicted value of ${scoreResult.predicted} m (${scoreResult.pctPredicted}% of predicted).`
      } else {
        sentence = `Your ${test.label} result of ${result.value} ${test.unit ?? ''} is ${friendly}.`
        if (scoreResult.percentile != null) sentence += ` This places you around the ${scoreResult.percentile}th percentile.`
      }

      if (sentence) lines.push(sentence)
    }
    lines.push('')
  }

  lines.push('─'.repeat(50))
  lines.push('DISCLAIMER')
  lines.push('Generated by ClinIQ Norms. Results reflect comparison against published')
  lines.push('normative data only. Clinical interpretation by a qualified practitioner')
  lines.push('is required. This output does not constitute a clinical diagnosis.')

  return lines.join('\n')
}

export function ExportScreen({ demographics, selectedTests, results, onNewClient, onBack }) {
  const [tab, setTab] = useState('clinical')
  const [copied, setCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const clinicalNote = useMemo(
    () => generateClinicalNote(demographics, selectedTests, results),
    [demographics, selectedTests, results]
  )

  const patientSummary = useMemo(
    () => generatePatientSummary(demographics, selectedTests, results),
    [demographics, selectedTests, results]
  )

  const activeText = tab === 'clinical' ? clinicalNote : patientSummary

  function handleCopy() {
    navigator.clipboard.writeText(activeText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Export Report</h2>
        <p className="text-sm text-gray-500 mt-1">Copy the report to paste into your clinical records</p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {[
          { id: 'clinical', label: 'Clinical Note' },
          { id: 'patient',  label: 'Patient Summary' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-3">
        {tab === 'clinical'
          ? 'Formatted for copy-paste into clinical notes software.'
          : 'Plain-English summary suitable for providing to the patient.'}
      </p>

      {/* Note textarea */}
      <textarea
        readOnly
        value={activeText}
        className="w-full h-72 px-4 py-3 rounded-xl border border-gray-300 font-mono text-xs text-gray-800 bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-brand-navy"
      />

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`w-full mt-3 py-3 rounded-xl font-semibold text-sm transition-all ${
          copied
            ? 'bg-green-600 text-white'
            : 'bg-brand-navy text-white hover:bg-blue-900 active:scale-95'
        }`}
      >
        {copied ? '✓ Copied to clipboard!' : 'Copy to Clipboard'}
      </button>

      {/* Disclaimer */}
      <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Disclaimer:</strong> This tool provides normative comparisons only and does not
          constitute clinical advice or diagnosis. Results should be interpreted by a qualified
          clinician in the context of the individual patient's history and presentation.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="px-5 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          Back to Results
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex-1 bg-red-600 text-white font-semibold py-3.5 rounded-xl hover:bg-red-700 active:scale-95 transition-all text-sm"
        >
          New Client
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Start New Client Assessment?"
        message="This will clear all current patient data including demographics, test selections, and results. This action cannot be undone."
        confirmLabel="Yes, Clear & Start Over"
        cancelLabel="Cancel"
        onConfirm={() => { setShowConfirm(false); onNewClient() }}
        onCancel={() => setShowConfirm(false)}
        destructive
      />
    </div>
  )
}
