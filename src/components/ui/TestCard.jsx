import { useState, useMemo } from 'react'
import { scoreTest, buildGaugeProps } from '../../utils/scoring.js'
import { calcHRMax } from '../../utils/calculations.js'
import { GaugeBar } from '../charts/GaugeBar.jsx'
import { ROM_NORMS } from '../../data/norms.js'

// ─── Input subcomponents ──────────────────────────────────────────────────────

function NumericInput({ value, onChange, placeholder, unit, inputMode = 'decimal' }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode={inputMode}
        pattern={inputMode === 'numeric' ? '[0-9]*' : undefined}
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
        placeholder={placeholder}
        className="flex-1 min-h-[44px] px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy text-base"
      />
      {unit && <span className="text-sm text-gray-500 font-medium w-14 flex-shrink-0">{unit}</span>}
    </div>
  )
}

function BilateralInput({ result, onChange, unit, isROM, isDominant }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Left {isDominant && result?.dominant === 'left' ? '★' : ''}</label>
          <NumericInput
            value={result?.left}
            onChange={v => onChange({ ...result, left: v })}
            placeholder="—"
            unit={unit}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Right {isDominant && result?.dominant === 'right' ? '★' : ''}</label>
          <NumericInput
            value={result?.right}
            onChange={v => onChange({ ...result, right: v })}
            placeholder="—"
            unit={unit}
          />
        </div>
      </div>
      {isDominant && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Dominant hand:</span>
          {['left', 'right'].map(side => (
            <button
              key={side}
              onClick={() => onChange({ ...result, dominant: side })}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                (result?.dominant ?? 'right') === side
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'border-gray-300 text-gray-600 hover:border-brand-navy'
              }`}
            >
              {side.charAt(0).toUpperCase() + side.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function BPInput({ result, onChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Systolic</label>
        <NumericInput value={result?.systolic} onChange={v => onChange({ ...result, systolic: v })} placeholder="120" unit="mmHg" inputMode="numeric" />
      </div>
      <span className="hidden sm:block text-2xl text-gray-300 font-light mt-5">/</span>
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Diastolic</label>
        <NumericInput value={result?.diastolic} onChange={v => onChange({ ...result, diastolic: v })} placeholder="80" unit="mmHg" inputMode="numeric" />
      </div>
    </div>
  )
}

function WHRInput({ result, onChange }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Waist circumference</label>
          <NumericInput value={result?.waist} onChange={v => onChange({ ...result, waist: v })} placeholder="85" unit="cm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Hip circumference</label>
          <NumericInput value={result?.hip} onChange={v => onChange({ ...result, hip: v })} placeholder="100" unit="cm" />
        </div>
      </div>
      {result?.waist && result?.hip && result.hip > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
          WHR: <strong>{(result.waist / result.hip).toFixed(2)}</strong>
        </div>
      )}
    </div>
  )
}

// ─── Berg Balance Scale Input (14 items, 0-4 each) ───────────────────────────
const BERG_ITEMS = [
  'Sitting to standing',
  'Standing unsupported',
  'Sitting with back unsupported (feet on floor)',
  'Standing to sitting',
  'Transfers',
  'Standing with eyes closed',
  'Standing with feet together',
  'Reaching forward with outstretched arm',
  'Retrieving object from floor',
  'Turning to look behind',
  'Turning 360 degrees',
  'Placing alternate foot on step or stool',
  'Standing with one foot in front',
  'Standing on one foot',
]

function BergInput({ result, onChange }) {
  const items = result?.items ?? Array(14).fill(null)
  const total = items.reduce((s, v) => s + (v ?? 0), 0)
  const allFilled = items.every(v => v !== null)

  function setItem(idx, val) {
    const next = [...items]
    next[idx] = val
    onChange({ ...result, items: next, value: next.reduce((s, v) => s + (v ?? 0), 0) })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {BERG_ITEMS.map((label, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-4 text-right flex-shrink-0">{idx + 1}.</span>
            <span className="text-xs text-gray-700 flex-1 min-w-0 leading-tight">{label}</span>
            <div className="flex gap-1 flex-shrink-0">
              {[0, 1, 2, 3, 4].map(score => (
                <button
                  key={score}
                  onClick={() => setItem(idx, score)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${
                    items[idx] === score
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'border-gray-300 text-gray-500 hover:border-brand-navy'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={`flex items-center justify-between p-3 rounded-xl ${allFilled ? 'bg-brand-navy/5' : 'bg-gray-50'}`}>
        <span className="text-sm text-gray-600">Total score:</span>
        <span className="text-xl font-bold text-brand-navy">{total} <span className="text-sm font-normal text-gray-400">/ 56</span></span>
      </div>
    </div>
  )
}

// ─── SPPB Input ───────────────────────────────────────────────────────────────
const SPPB_SUBTESTS = [
  {
    key: 'balanceScore',
    label: 'Balance Tests',
    description: 'Standing balance: side-by-side, semi-tandem, tandem',
    maxScore: 4,
    scoring: ['Unable to hold side-by-side for 10s', 'Holds side-by-side for 10s', 'Holds semi-tandem for 10s', 'Holds tandem for 3-9s', 'Holds tandem for 10s'],
  },
  {
    key: 'gaitScore',
    label: 'Gait Speed (4m walk)',
    description: 'Fastest of two 4-metre timed walks',
    maxScore: 4,
    scoring: ['Unable to complete', '≥8.70s', '6.21–8.70s', '4.82–6.20s', '≤4.82s'],
  },
  {
    key: 'chairStandScore',
    label: 'Chair Stand Test (5×)',
    description: '5 chair stands as fast as possible without arm use',
    maxScore: 4,
    scoring: ['Unable to complete', '≥16.7s', '13.70–16.69s', '11.20–13.69s', '≤11.19s'],
  },
]

function SPPBInput({ result, onChange }) {
  const scores = { balanceScore: result?.balanceScore ?? null, gaitScore: result?.gaitScore ?? null, chairStandScore: result?.chairStandScore ?? null }
  const total = [scores.balanceScore, scores.gaitScore, scores.chairStandScore].every(v => v != null)
    ? scores.balanceScore + scores.gaitScore + scores.chairStandScore
    : null

  function setScore(key, val) {
    const next = { ...result, [key]: val }
    const b = next.balanceScore ?? null, g = next.gaitScore ?? null, c = next.chairStandScore ?? null
    if (b != null && g != null && c != null) next.value = b + g + c
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {SPPB_SUBTESTS.map(sub => (
        <div key={sub.key} className="space-y-2">
          <div>
            <p className="text-sm font-medium text-gray-800">{sub.label}</p>
            <p className="text-xs text-gray-500">{sub.description}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[0, 1, 2, 3, 4].map(score => (
              <button
                key={score}
                onClick={() => setScore(sub.key, score)}
                title={sub.scoring[score]}
                className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                  scores[sub.key] === score
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'border-gray-300 text-gray-600 hover:border-brand-navy'
                }`}
              >
                {score}
              </button>
            ))}
            {scores[sub.key] != null && (
              <span className="self-center text-xs text-gray-400 italic ml-1">{sub.scoring[scores[sub.key]]}</span>
            )}
          </div>
        </div>
      ))}
      {total != null && (
        <div className="flex items-center justify-between p-3 bg-brand-navy/5 rounded-xl">
          <span className="text-sm text-gray-600">Total SPPB score:</span>
          <span className="text-xl font-bold text-brand-navy">{total} <span className="text-sm font-normal text-gray-400">/ 12</span></span>
        </div>
      )}
    </div>
  )
}

// ─── CCFT Input ───────────────────────────────────────────────────────────────
const CCFT_LEVELS = [22, 24, 26, 28, 30]

function CCFTInput({ result, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500 mb-3">Select the highest pressure level (mmHg) held for 10s without superficial muscle substitution:</p>
        <div className="flex gap-2 flex-wrap">
          {CCFT_LEVELS.map(lvl => (
            <button
              key={lvl}
              onClick={() => onChange({ ...result, achievedLevel: lvl })}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                result?.achievedLevel === lvl
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'border-gray-300 text-gray-700 hover:border-brand-navy'
              }`}
            >
              {lvl} mmHg
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Clinical observations / substitution patterns</label>
        <textarea
          value={result?.notes ?? ''}
          onChange={e => onChange({ ...result, notes: e.target.value })}
          placeholder="e.g. SCM substitution at 26mmHg, chin retraction observed..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
        />
      </div>
    </div>
  )
}

// ─── Single Leg Squat Input ───────────────────────────────────────────────────
const SLS_FAULTS = [
  'Contralateral pelvic drop',
  'Ipsilateral trunk lean',
  'Knee valgus (medial collapse)',
  'Excessive forward trunk lean',
  'Loss of balance',
  'Inability to complete',
]

function SingleLegSquatInput({ result, onChange }) {
  function setSide(side, val) {
    onChange({ ...result, [`${side}Result`]: val, [`${side}Faults`]: val === 'pass' ? [] : (result?.[`${side}Faults`] ?? []) })
  }

  function toggleFault(side, fault) {
    const key = `${side}Faults`
    const current = result?.[key] ?? []
    const next = current.includes(fault) ? current.filter(f => f !== fault) : [...current, fault]
    onChange({ ...result, [key]: next })
  }

  return (
    <div className="space-y-4">
      {['left', 'right'].map(side => (
        <div key={side} className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 capitalize">{side} leg</p>
          <div className="flex gap-2">
            {['pass', 'fail'].map(opt => (
              <button
                key={opt}
                onClick={() => setSide(side, opt)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border capitalize transition-colors ${
                  result?.[`${side}Result`] === opt
                    ? opt === 'pass' ? 'bg-green-600 text-white border-green-600' : 'bg-red-500 text-white border-red-500'
                    : 'border-gray-300 text-gray-600 hover:border-brand-navy'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {result?.[`${side}Result`] === 'fail' && (
            <div className="pl-2 space-y-1.5">
              <p className="text-xs text-gray-500">Movement faults observed:</p>
              {SLS_FAULTS.map(fault => (
                <label key={fault} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(result?.[`${side}Faults`] ?? []).includes(fault)}
                    onChange={() => toggleFault(side, fault)}
                    className="accent-brand-navy"
                  />
                  <span className="text-xs text-gray-700">{fault}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Additional notes</label>
        <textarea
          value={result?.notes ?? ''}
          onChange={e => onChange({ ...result, notes: e.target.value })}
          placeholder="e.g. pain reported at end range, compensatory strategies..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
        />
      </div>
    </div>
  )
}

// ─── ER:IR Ratio Input ────────────────────────────────────────────────────────
function ERIRInput({ result, onChange }) {
  const leftRatio = (result?.leftER && result?.leftIR && result.leftIR > 0)
    ? (result.leftER / result.leftIR).toFixed(2) : null
  const rightRatio = (result?.rightER && result?.rightIR && result.rightIR > 0)
    ? (result.rightER / result.rightIR).toFixed(2) : null

  return (
    <div className="space-y-4">
      {['left', 'right'].map(side => (
        <div key={side} className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 capitalize">{side}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">ER force</label>
              <NumericInput
                value={result?.[`${side}ER`]}
                onChange={v => onChange({ ...result, [`${side}ER`]: v })}
                placeholder="kg"
                unit="kg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">IR force</label>
              <NumericInput
                value={result?.[`${side}IR`]}
                onChange={v => onChange({ ...result, [`${side}IR`]: v })}
                placeholder="kg"
                unit="kg"
              />
            </div>
          </div>
          {side === 'left' && leftRatio && (
            <RatioDisplay ratio={leftRatio} label="Left ER:IR" />
          )}
          {side === 'right' && rightRatio && (
            <RatioDisplay ratio={rightRatio} label="Right ER:IR" />
          )}
        </div>
      ))}
    </div>
  )
}

function RatioDisplay({ ratio, label }) {
  const r = parseFloat(ratio)
  const color = r < 0.60 ? 'text-red-700 bg-red-50' : r < 0.75 ? 'text-amber-700 bg-amber-50' : 'text-green-700 bg-green-50'
  return (
    <div className={`px-3 py-2 rounded-lg text-sm font-medium ${color}`}>
      {label} ratio: <strong>{ratio}</strong>
      {r < 0.75 && <span className="ml-2 text-xs font-normal">— below 0.75 target</span>}
    </div>
  )
}

// ─── McGill Battery Input ─────────────────────────────────────────────────────
function McGillBatteryInput({ result, onChange }) {
  const { flexor, extensor, sideBridgeLeft, sideBridgeRight } = result ?? {}

  const flexExtRatio = (flexor && extensor && extensor > 0) ? (flexor / extensor).toFixed(2) : null
  const avgSB = (sideBridgeLeft && sideBridgeRight) ? ((sideBridgeLeft + sideBridgeRight) / 2) : (sideBridgeLeft ?? sideBridgeRight ?? null)
  const sbExtRatio = (avgSB != null && extensor && extensor > 0) ? (avgSB / extensor).toFixed(2) : null

  const components = [
    { key: 'flexor',         label: 'Trunk Flexor Hold', description: 'Supine, knees bent, feet flat, trunk at 45°' },
    { key: 'extensor',       label: 'Trunk Extensor Hold (Biering-Sørensen)', description: 'Prone, pelvis on plinth, lower body supported' },
    { key: 'sideBridgeLeft', label: 'Side Bridge — Left', description: 'Side-lying, hips raised, held horizontal' },
    { key: 'sideBridgeRight',label: 'Side Bridge — Right', description: 'Side-lying, hips raised, held horizontal' },
  ]

  return (
    <div className="space-y-4">
      {components.map(comp => (
        <div key={comp.key}>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">{comp.label}</label>
          <p className="text-xs text-gray-400 mb-1.5">{comp.description}</p>
          <NumericInput
            value={result?.[comp.key]}
            onChange={v => onChange({ ...result, [comp.key]: v })}
            placeholder="seconds"
            unit="s"
          />
        </div>
      ))}

      {(flexExtRatio || sbExtRatio) && (
        <div className="p-3 bg-gray-50 rounded-xl space-y-2">
          <p className="text-xs font-semibold text-gray-700">Ratio Analysis</p>
          {flexExtRatio && (
            <div className={`text-xs px-2 py-1.5 rounded-lg font-medium ${parseFloat(flexExtRatio) > 1.0 ? 'text-amber-700 bg-amber-50' : 'text-green-700 bg-green-50'}`}>
              Flex:Ext = {flexExtRatio} {parseFloat(flexExtRatio) > 1.0 ? '⚑ >1.0 (extension should be dominant)' : '✓ within target (<1.0)'}
            </div>
          )}
          {sbExtRatio && (
            <div className={`text-xs px-2 py-1.5 rounded-lg font-medium ${parseFloat(sbExtRatio) < 0.75 ? 'text-amber-700 bg-amber-50' : 'text-green-700 bg-green-50'}`}>
              Side Bridge:Ext = {sbExtRatio} {parseFloat(sbExtRatio) < 0.75 ? '⚑ <0.75 target' : '✓ within target (≥0.75)'}
            </div>
          )}
          {sideBridgeLeft != null && sideBridgeRight != null && (
            (() => {
              const diff = Math.abs(sideBridgeLeft - sideBridgeRight)
              const maxSB = Math.max(sideBridgeLeft, sideBridgeRight)
              const pct = maxSB > 0 ? Math.round(diff / maxSB * 100) : 0
              return pct > 15 ? (
                <div className="text-xs px-2 py-1.5 rounded-lg font-medium text-amber-700 bg-amber-50">
                  ⚑ Side bridge asymmetry: {pct}% difference (L {sideBridgeLeft}s / R {sideBridgeRight}s)
                </div>
              ) : null
            })()
          )}
        </div>
      )}
    </div>
  )
}

// ─── Knee to Wall Input ───────────────────────────────────────────────────────
function KneeToWallInput({ result, onChange }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Left</label>
          <NumericInput value={result?.left} onChange={v => onChange({ ...result, left: v, unit: 'cm' })} placeholder="e.g. 10" unit="cm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Right</label>
          <NumericInput value={result?.right} onChange={v => onChange({ ...result, right: v, unit: 'cm' })} placeholder="e.g. 10" unit="cm" />
        </div>
      </div>
      {(result?.left != null || result?.right != null) && (
        <p className="text-xs text-gray-400 italic">Functional threshold: ≥9 cm from wall (Bennell et al., 1998)</p>
      )}
    </div>
  )
}

// ─── Modified Tardieu Scale ───────────────────────────────────────────────────
const TARDIEU_MUSCLE_GROUPS = [
  { value: 'elbowFlexors',        label: 'Elbow Flexors' },
  { value: 'elbowExtensors',      label: 'Elbow Extensors' },
  { value: 'wristFlexors',        label: 'Wrist Flexors' },
  { value: 'wristExtensors',      label: 'Wrist Extensors' },
  { value: 'hipAdductors',        label: 'Hip Adductors' },
  { value: 'kneeFlexors',         label: 'Knee Flexors' },
  { value: 'kneeExtensors',       label: 'Knee Extensors' },
  { value: 'anklePlantarflexors', label: 'Ankle Plantarflexors' },
]

const TARDIEU_X_GRADES = [
  { value: '0', label: '0 — No resistance throughout' },
  { value: '1', label: '1 — Slight resistance, no clear catch' },
  { value: '2', label: '2 — Clear catch, then release' },
  { value: '3', label: '3 — Fatigable clonus (<10s)' },
  { value: '4', label: '4 — Non-fatigable clonus (>10s)' },
  { value: '5', label: '5 — Joint immovable' },
]

function TardieuInput({ result, onChange }) {
  const assessments = result?.assessments ?? []

  function addAssessment() {
    onChange({ ...result, assessments: [...assessments, { id: Date.now(), muscleGroup: '', side: 'left', r1: '', r2: '', xGrade: '', notes: '' }] })
  }

  function updateAssessment(id, field, value) {
    onChange({ ...result, assessments: assessments.map(a => a.id === id ? { ...a, [field]: value } : a) })
  }

  function removeAssessment(id) {
    onChange({ ...result, assessments: assessments.filter(a => a.id !== id) })
  }

  return (
    <div className="space-y-4">
      {assessments.map(a => {
        const r1 = parseFloat(a.r1), r2 = parseFloat(a.r2)
        const spasticityAngle = (!isNaN(r1) && !isNaN(r2)) ? r2 - r1 : null
        return (
          <div key={a.id} className="p-3 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">Assessment</p>
              <button onClick={() => removeAssessment(a.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Muscle group</label>
                <select
                  value={a.muscleGroup}
                  onChange={e => updateAssessment(a.id, 'muscleGroup', e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-navy bg-white"
                >
                  <option value="">Select...</option>
                  {TARDIEU_MUSCLE_GROUPS.map(mg => (
                    <option key={mg.value} value={mg.value}>{mg.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Side</label>
                <div className="flex gap-2 mt-1">
                  {['left', 'right', 'bilateral'].map(s => (
                    <button
                      key={s}
                      onClick={() => updateAssessment(a.id, 'side', s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                        a.side === s ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-300 text-gray-600 hover:border-brand-navy'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">R1 — angle of catch (°)</label>
                <NumericInput value={a.r1 === '' ? null : a.r1} onChange={v => updateAssessment(a.id, 'r1', v ?? '')} placeholder="°" unit="°" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">R2 — full passive ROM (°)</label>
                <NumericInput value={a.r2 === '' ? null : a.r2} onChange={v => updateAssessment(a.id, 'r2', v ?? '')} placeholder="°" unit="°" />
              </div>
            </div>
            {spasticityAngle != null && (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                Spasticity angle (R2−R1): <strong>{spasticityAngle}°</strong>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">X grade</label>
              <select
                value={a.xGrade}
                onChange={e => updateAssessment(a.id, 'xGrade', e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-navy bg-white"
              >
                <option value="">Select grade...</option>
                {TARDIEU_X_GRADES.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes <span className="font-normal text-gray-400">(optional)</span></label>
              <textarea
                value={a.notes ?? ''}
                onChange={e => updateAssessment(a.id, 'notes', e.target.value)}
                placeholder="Clinical observations..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
              />
            </div>
          </div>
        )
      })}
      <button
        onClick={addAssessment}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-brand-navy/30 text-brand-navy text-sm font-medium hover:border-brand-navy/60 hover:bg-brand-navy/5 transition-colors"
      >
        + Add muscle group
      </button>
    </div>
  )
}

function TardieuScoreDisplay({ score }) {
  if (!score?.assessments?.length) return null
  const gradeColor = g => {
    const n = parseInt(g)
    if (isNaN(n)) return 'text-gray-700 bg-gray-100'
    if (n <= 1) return 'text-green-700 bg-green-50'
    if (n === 2) return 'text-amber-700 bg-amber-50'
    return 'text-red-700 bg-red-50'
  }
  return (
    <div className="space-y-3">
      {score.assessments.map((a, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              {a.muscleGroupLabel ?? a.muscleGroup}
              {a.side && a.side !== 'bilateral' && <span className="ml-1.5 text-xs font-normal text-gray-500 capitalize">{a.side}</span>}
              {a.side === 'bilateral' && <span className="ml-1.5 text-xs font-normal text-gray-500">bilateral</span>}
            </span>
            {a.xGrade !== '' && a.xGrade != null && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${gradeColor(a.xGrade)}`}>
                Grade {a.xGrade}
              </span>
            )}
          </div>
          <div className="flex gap-4 text-xs text-gray-600">
            {a.r1 !== '' && a.r1 != null && <span>R1: <strong>{a.r1}°</strong></span>}
            {a.r2 !== '' && a.r2 != null && <span>R2: <strong>{a.r2}°</strong></span>}
            {a.spasticityAngle != null && <span>Spasticity angle: <strong>{a.spasticityAngle}°</strong></span>}
          </div>
          {a.notes && <p className="text-xs text-gray-500 italic">{a.notes}</p>}
        </div>
      ))}
      {score.source && <p className="text-xs text-gray-400 leading-relaxed">{score.source}</p>}
    </div>
  )
}

// ─── SpO2 Input ───────────────────────────────────────────────────────────────
function SpO2Input({ result, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Resting SpO₂</label>
        <NumericInput value={result?.resting} onChange={v => onChange({ ...result, resting: v })} placeholder="e.g. 98" unit="%" inputMode="numeric" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Post-exercise SpO₂ <span className="font-normal text-gray-400">(optional)</span></label>
        <NumericInput value={result?.postExercise} onChange={v => onChange({ ...result, postExercise: v })} placeholder="—" unit="%" inputMode="numeric" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={result?.supplementalO2 ?? false}
          onChange={e => onChange({ ...result, supplementalO2: e.target.checked })}
          className="w-4 h-4 accent-brand-navy"
        />
        <span className="text-xs text-gray-700">Patient on supplemental oxygen</span>
      </label>
      {result?.supplementalO2 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Flow rate</label>
          <NumericInput value={result?.flowRate} onChange={v => onChange({ ...result, flowRate: v })} placeholder="e.g. 2" unit="L/min" />
        </div>
      )}
    </div>
  )
}

// ─── Score display helpers ────────────────────────────────────────────────────

const COLOR_MAP = {
  'zone-red': 'text-red-600 bg-red-50', 'zone-amber': 'text-amber-700 bg-amber-50',
  'zone-green': 'text-green-700 bg-green-50', 'zone-blue': 'text-blue-700 bg-blue-50',
}

function CategoryBadge({ category, color }) {
  if (!category) return null
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${COLOR_MAP[color] ?? 'text-gray-700 bg-gray-100'}`}>
      {category}
    </span>
  )
}

function BilateralScoreDisplay({ testId, leftScore, rightScore, result, demographics }) {
  const sides = [
    { label: 'Left', score: leftScore, value: result?.left },
    { label: 'Right', score: rightScore, value: result?.right },
  ]
  const isROM = !!ROM_NORMS.joints[testId]

  return (
    <div className="space-y-4">
      {sides.map(({ label, score, value }) => {
        if (!score || value === null || value === undefined) return null
        const gaugeProps = buildGaugeProps(testId, score, value, demographics)
        return (
          <div key={label}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
              {score && <CategoryBadge category={score.category} color={score.color} />}
            </div>
            {isROM && score.rangeMin != null && score.rangeMax != null && (
              <p className="text-xs text-gray-400 mb-2">Normal: {score.rangeMin}–{score.rangeMax}°</p>
            )}
            {score && !score.insufficient && gaugeProps && <GaugeBar {...gaugeProps} />}
          </div>
        )
      })}
      {leftScore?.flags?.length > 0 && (
        <div className="space-y-1">
          {leftScore.flags.map((f, i) => (
            <p key={i} className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">⚑ {f}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function McGillScoreDisplay({ score }) {
  if (!score) return null
  const { scores, flags } = score
  const components = [
    { key: 'flexor', label: 'Flexor' },
    { key: 'extensor', label: 'Extensor' },
    { key: 'sideBridgeLeft', label: 'Side Bridge L' },
    { key: 'sideBridgeRight', label: 'Side Bridge R' },
  ]
  return (
    <div className="space-y-3">
      {components.map(({ key, label }) => scores[key] ? (
        <div key={key} className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">{scores[key].value}s</span>
            <CategoryBadge category={scores[key].category} color={scores[key].color} />
          </div>
        </div>
      ) : null)}
      {flags?.length > 0 && (
        <div className="space-y-1 pt-2">
          {flags.map((f, i) => (
            <p key={i} className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">⚑ {f}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function ERIRScoreDisplay({ score }) {
  if (!score) return null
  const { left, right, ratios, flags } = score
  return (
    <div className="space-y-3">
      {['left', 'right'].map(side => {
        const s = side === 'left' ? left : right
        const ratio = ratios?.[side]
        if (!s) return null
        return (
          <div key={side} className="flex items-center justify-between">
            <span className="text-xs text-gray-600 capitalize">{side}</span>
            <div className="flex items-center gap-2">
              {ratio != null && <span className="text-sm font-medium text-gray-800">ratio {ratio}</span>}
              <CategoryBadge category={s.category} color={s.color} />
            </div>
          </div>
        )
      })}
      {flags?.length > 0 && (
        <div className="space-y-1">
          {flags.map((f, i) => (
            <p key={i} className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">⚑ {f}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main TestCard ─────────────────────────────────────────────────────────────

export function TestCard({ test, demographics, result, onResultChange, readonly }) {
  const [collapsed, setCollapsed] = useState(false)

  const score = useMemo(() => {
    if (test.inputType === 'notes') return null
    if (test.inputType === 'auto') {
      return result?.value != null ? { category: result.category, color: result.color, insufficient: false } : null
    }

    if (test.inputType === 'spo2') {
      if (result?.resting == null) return null
      return scoreTest(test.id, result, demographics)
    }
    if (test.inputType === 'berg') {
      if (result?.value == null) return null
      return scoreTest(test.id, result, demographics)
    }
    if (test.inputType === 'sppb') {
      if (result?.balanceScore == null && result?.gaitScore == null && result?.chairStandScore == null) return null
      return scoreTest(test.id, result, demographics)
    }
    if (test.inputType === 'ccft') {
      if (!result?.achievedLevel) return null
      return scoreTest(test.id, result, demographics)
    }
    if (test.inputType === 'singleLegSquat') {
      if (!result?.leftResult && !result?.rightResult) return null
      return scoreTest(test.id, result, demographics)
    }
    if (test.inputType === 'mcGillBattery') {
      const { flexor, extensor, sideBridgeLeft, sideBridgeRight } = result ?? {}
      if (!flexor && !extensor && !sideBridgeLeft && !sideBridgeRight) return null
      return scoreTest(test.id, result, demographics)
    }
    if (test.inputType === 'erirRatio') {
      if (!result?.leftER && !result?.leftIR && !result?.rightER && !result?.rightIR) return null
      return scoreTest(test.id, result, demographics)
    }
    if (test.inputType === 'kneeToWall') {
      if (result?.left == null && result?.right == null) return null
      return scoreTest(test.id, result, demographics)
    }
    if (test.inputType === 'tardieuScale') {
      if (!result?.assessments?.length) return null
      return scoreTest(test.id, result, demographics)
    }

    let re = result
    if (test.id === 'waistHipRatio' && result?.waist && result?.hip) {
      re = { ...result, value: result.waist / result.hip }
    }
    if (re === null || re === undefined) return null

    const hasValue = re.value !== null && re.value !== undefined && !isNaN(re.value)
    const hasBilateral = (re.left !== null && re.left !== undefined) || (re.right !== null && re.right !== undefined)
    const hasBP = re.systolic !== null && re.systolic !== undefined && re.diastolic !== null && re.diastolic !== undefined

    if (!hasValue && !hasBilateral && !hasBP) return null

    return scoreTest(test.id, re, demographics)
  }, [result, demographics, test.id, test.inputType])

  const isMcGill   = test.inputType === 'mcGillBattery'
  const isERIR     = test.inputType === 'erirRatio'
  const isTardieu  = test.inputType === 'tardieuScale'
  const isBilateral = score && typeof score === 'object' && 'left' in score && !isMcGill && !isERIR && !isTardieu
  const primaryScore = isMcGill || isERIR || isTardieu ? null
    : score && typeof score === 'object' && 'category' in score ? score
    : score?.primary ?? score?.left ?? null
  const hasSingularScore = score && !isBilateral && !score.insufficient && !isMcGill && !isERIR && !isTardieu && 'category' in score

  const hasAnyResult = (() => {
    if (!result) return false
    if (result.value !== null && result.value !== undefined) return true
    if (result.left !== null && result.left !== undefined) return true
    if (result.right !== null && result.right !== undefined) return true
    if (result.systolic !== null && result.systolic !== undefined) return true
    if (result.resting !== null && result.resting !== undefined) return true
    if (result.notes) return true
    if (result.achievedLevel) return true
    if (result.leftResult || result.rightResult) return true
    if (result.items?.some(v => v !== null)) return true
    if (result.balanceScore != null || result.gaitScore != null || result.chairStandScore != null) return true
    if (result.flexor || result.extensor || result.sideBridgeLeft || result.sideBridgeRight) return true
    if (result.leftER || result.rightER) return true
    if (result.assessments?.length > 0) return true
    return false
  })()

  const flags = primaryScore?.flags ?? []
  const mcGillFlags = isMcGill ? (score?.flags ?? []) : []
  const erirFlags = isERIR ? (score?.flags ?? []) : []
  const hasFlags = flags.length > 0 || mcGillFlags.length > 0 || erirFlags.length > 0 ||
    (isBilateral && (score?.left?.flags?.length > 0 || score?.right?.flags?.length > 0))

  // 6MWT HRmax target
  const hrMaxTarget = test.id === 'sixMWT'
    ? (() => {
        const hrMax = calcHRMax(demographics.age, demographics.hrMaxFormula)
        return hrMax ? Math.round(hrMax * 0.85) : null
      })()
    : null

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-start justify-between p-4 gap-3 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{test.label}</h3>
            {test.unit && <span className="text-xs text-gray-400">({test.unit})</span>}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {primaryScore && !primaryScore.insufficient && (
              <CategoryBadge category={primaryScore.category} color={primaryScore.color} />
            )}
            {hasFlags && (
              <span className="text-xs text-amber-600 font-medium">⚑ {flags.length + mcGillFlags.length + erirFlags.length > 0 ? flags.length + mcGillFlags.length + erirFlags.length : ''} flag{(flags.length + mcGillFlags.length + erirFlags.length) !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-1 transition-transform ${collapsed ? '-rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 border-t border-gray-50">
          {/* Input section */}
          <div className="mt-4">
            {readonly ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600 text-sm">Auto-calculated:</span>
                <span className="font-bold text-gray-900">{result?.value?.toFixed?.(1) ?? result?.value}</span>
                <span className="text-sm text-gray-400">{test.unit}</span>
                {primaryScore && <CategoryBadge category={primaryScore.category} color={primaryScore.color} />}
              </div>
            ) : test.inputType === 'notes' ? (
              <textarea
                value={result?.notes ?? ''}
                onChange={e => onResultChange({ notes: e.target.value })}
                placeholder="Enter clinical notes, findings, or observations..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
              />
            ) : test.inputType === 'bp' ? (
              <BPInput result={result} onChange={onResultChange} />
            ) : test.inputType === 'whr' ? (
              <WHRInput result={result} onChange={onResultChange} />
            ) : test.inputType === 'spo2' ? (
              <SpO2Input result={result} onChange={onResultChange} />
            ) : test.inputType === 'bilateral' ? (
              <BilateralInput
                result={result}
                onChange={onResultChange}
                unit={test.unit}
                isROM={test.isROM}
                isDominant={test.id === 'gripStrength'}
              />
            ) : test.inputType === 'berg' ? (
              <BergInput result={result} onChange={onResultChange} />
            ) : test.inputType === 'sppb' ? (
              <SPPBInput result={result} onChange={onResultChange} />
            ) : test.inputType === 'ccft' ? (
              <CCFTInput result={result} onChange={onResultChange} />
            ) : test.inputType === 'singleLegSquat' ? (
              <SingleLegSquatInput result={result} onChange={onResultChange} />
            ) : test.inputType === 'mcGillBattery' ? (
              <McGillBatteryInput result={result} onChange={onResultChange} />
            ) : test.inputType === 'erirRatio' ? (
              <ERIRInput result={result} onChange={onResultChange} />
            ) : test.inputType === 'kneeToWall' ? (
              <KneeToWallInput result={result} onChange={onResultChange} />
            ) : test.inputType === 'tardieuScale' ? (
              <TardieuInput result={result} onChange={onResultChange} />
            ) : test.id === 'sixMWT' ? (
              <div className="space-y-3">
                <NumericInput
                  value={result?.value}
                  onChange={v => onResultChange({ ...result, value: v })}
                  placeholder="Enter metres"
                  unit={test.unit}
                />
                {hrMaxTarget && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600">Target HR (85% HRmax): <span className="font-bold text-gray-900">{hrMaxTarget} bpm</span></p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Heart Rate Achieved <span className="font-normal text-gray-400">(optional)</span></label>
                  <NumericInput
                    value={result?.hrAchieved}
                    onChange={v => onResultChange({ ...result, hrAchieved: v })}
                    placeholder="bpm"
                    unit="bpm"
                    inputMode="numeric"
                  />
                </div>
              </div>
            ) : (
              <NumericInput
                value={result?.value}
                onChange={v => onResultChange({ value: v })}
                placeholder={`Enter ${test.unit ?? 'value'}`}
                unit={test.unit}
              />
            )}
          </div>

          {/* 6MWT prediction display */}
          {test.id === 'sixMWT' && score && !score.insufficient && score.predicted && (
            <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm">
              <span className="text-gray-600">Predicted distance: </span>
              <span className="font-semibold text-blue-800">{score.predicted} m</span>
              <span className="text-gray-500 ml-2">({score.pctPredicted}% of predicted)</span>
            </div>
          )}

          {/* Chart / results section */}
          {hasAnyResult && score && (
            <div className="mt-5">
              {isTardieu ? (
                <TardieuScoreDisplay score={score} />
              ) : isMcGill ? (
                <McGillScoreDisplay score={score} />
              ) : isERIR ? (
                <ERIRScoreDisplay score={score} />
              ) : primaryScore?.insufficient ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">⚑ {primaryScore.insufficientReason}</p>
                </div>
              ) : isBilateral ? (
                <BilateralScoreDisplay
                  testId={test.id}
                  leftScore={score.left}
                  rightScore={score.right}
                  result={result}
                  demographics={demographics}
                />
              ) : hasSingularScore ? (
                <div>
                  {ROM_NORMS.joints[test.id] && score.rangeMin != null && score.rangeMax != null && (
                    <p className="text-xs text-gray-400 mb-2">Normal: {score.rangeMin}–{score.rangeMax}°</p>
                  )}
                  {score.flags?.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {score.flags.map((f, i) => (
                        <p key={i} className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">⚑ {f}</p>
                      ))}
                    </div>
                  )}
                  {(() => {
                    const gaugeProps = buildGaugeProps(test.id, score, result?.value, demographics)
                    return gaugeProps ? <GaugeBar {...gaugeProps} /> : null
                  })()}
                </div>
              ) : null}

              {/* Caveat */}
              {(test.caveat || primaryScore?.caveat) && (
                <p className="mt-3 text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">
                  {test.caveat || primaryScore?.caveat}
                </p>
              )}
            </div>
          )}

          {/* Citation */}
          {test.citation && (
            <div className="mt-4 pt-3 border-t border-gray-50">
              <p className="text-xs text-gray-400 leading-relaxed">{test.citation}</p>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
