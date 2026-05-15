import { useState } from 'react'
import { calcBMI, calcHRMax } from '../../utils/calculations.js'

const HR_FORMULAS = [
  { value: 'tanaka', label: 'Tanaka (208 − 0.7 × age)', note: 'Recommended — most accurate for adults' },
  { value: 'fox',    label: 'Fox (220 − age)',           note: 'Classic / widely used' },
  { value: 'gelish', label: 'Gelish (207 − 0.7 × age)', note: 'Alternative age-adjusted' },
]

const BODY_FAT_METHODS = [
  { value: 'skinfold', label: 'Skinfold calipers' },
  { value: 'bia',      label: 'Bioelectrical impedance (BIA)' },
  { value: 'dexa',     label: 'DEXA scan' },
  { value: 'hydro',    label: 'Hydrostatic weighing' },
  { value: 'bmi',      label: 'BMI-based estimate (Deurenberg)' },
  { value: 'manual',   label: 'Manual / other' },
]

const VO2_METHODS = [
  { value: 'direct',   label: 'Direct (metabolic cart)' },
  { value: 'indirect', label: 'Indirect / field test' },
  { value: 'predicted',label: 'Predicted / estimated' },
]

function Field({ label, hint, error, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {hint && <span className="ml-1 text-xs text-gray-400 font-normal">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function NumericInput({ value, onChange, placeholder, inputMode = 'decimal' }) {
  return (
    <input
      type="text"
      inputMode={inputMode}
      pattern={inputMode === 'numeric' ? '[0-9]*' : undefined}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full min-h-[44px] px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy text-base"
    />
  )
}

export function DemographicsForm({ demographics, onUpdate, onNext, onBack }) {
  const [errors, setErrors] = useState({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { age, sex, height, weight, smoker, betablockers, hrMaxFormula, bodyFatMethod, vo2maxMethod } = demographics

  const bmi = calcBMI(height, weight)
  const hrMax = age ? calcHRMax(age, hrMaxFormula) : null

  function validate() {
    const errs = {}
    if (!age || age < 5 || age > 110) errs.age = 'Enter a valid age (5–110 years)'
    if (!sex) errs.sex = 'Please select a sex'
    if (!height || height < 100 || height > 250) errs.height = 'Enter height between 100–250 cm'
    if (!weight || weight < 20 || weight > 300) errs.weight = 'Enter weight between 20–300 kg'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  const bmiBadgeColor = !bmi ? '' : bmi < 18.5 ? 'bg-blue-100 text-blue-800' : bmi < 25 ? 'bg-green-100 text-green-800' : bmi < 30 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
  const bmiLabel = !bmi ? '' : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Patient Demographics</h2>
        <p className="text-sm text-gray-500 mt-1">Used to select the correct normative reference tables</p>
      </div>

      {/* Age */}
      <Field label="Age" hint="years" error={errors.age}>
        <NumericInput value={age} onChange={v => onUpdate({ age: v })} placeholder="e.g. 45" inputMode="numeric" />
      </Field>

      {/* Sex */}
      <Field label="Biological Sex" error={errors.sex}>
        <div className="flex gap-3">
          {['male', 'female', 'other'].map(s => (
            <button
              key={s}
              onClick={() => onUpdate({ sex: s })}
              className={`flex-1 py-3 rounded-xl border font-medium text-sm capitalize transition-colors ${
                sex === s
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-navy'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {sex === 'other' && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800 leading-relaxed">
              Most normative tables are sex-stratified. Where applicable, you will be prompted to
              manually select which normative table (male or female) to compare against.
            </p>
          </div>
        )}
      </Field>

      {/* Height */}
      <Field label="Height" hint="cm" error={errors.height}>
        <NumericInput value={height} onChange={v => onUpdate({ height: v })} placeholder="e.g. 170" inputMode="decimal" />
      </Field>

      {/* Weight */}
      <Field label="Weight" hint="kg" error={errors.weight}>
        <NumericInput value={weight} onChange={v => onUpdate({ weight: v })} placeholder="e.g. 75" inputMode="decimal" />
      </Field>

      {/* BMI live preview */}
      {bmi && (
        <div className="mb-5 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div>
            <span className="text-sm text-gray-600">Calculated BMI: </span>
            <span className="font-bold text-gray-900">{bmi} kg/m²</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bmiBadgeColor}`}>{bmiLabel}</span>
        </div>
      )}

      {/* Smoker */}
      <Field label="Smoking Status">
        <div className="flex gap-3">
          {[{ val: false, label: 'Non-smoker' }, { val: true, label: 'Smoker' }].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => onUpdate({ smoker: opt.val })}
              className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-colors ${
                smoker === opt.val
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-navy'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Beta-blockers */}
      <Field label="Beta-blockers">
        <div className="flex gap-3">
          {[{ val: false, label: 'No' }, { val: true, label: 'Yes' }].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => onUpdate({ betablockers: opt.val })}
              className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-colors ${
                betablockers === opt.val
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-navy'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {betablockers && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            Beta-blockers will be noted in resting HR interpretation.
          </p>
        )}
      </Field>

      {/* Advanced Settings */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">Advanced Settings</span>
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="px-4 py-4 space-y-5 border-t border-gray-200">
            {/* HRmax formula */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Predicted HRmax Formula
                {hrMax && age && (
                  <span className="ml-2 text-brand-teal font-normal">→ {hrMax} bpm for age {age}</span>
                )}
              </label>
              <div className="space-y-2">
                {HR_FORMULAS.map(f => (
                  <label key={f.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="hrFormula"
                      value={f.value}
                      checked={hrMaxFormula === f.value}
                      onChange={() => onUpdate({ hrMaxFormula: f.value })}
                      className="mt-0.5 accent-brand-navy"
                    />
                    <div>
                      <p className="text-sm text-gray-800">{f.label}</p>
                      <p className="text-xs text-gray-500">{f.note}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Body fat method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Body Fat % Estimation Method</label>
              <select
                value={bodyFatMethod}
                onChange={e => onUpdate({ bodyFatMethod: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-navy text-sm"
              >
                {BODY_FAT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            {/* VO2max method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">VO₂max Assessment Method</label>
              <select
                value={vo2maxMethod}
                onChange={e => onUpdate({ vo2maxMethod: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-navy text-sm"
              >
                {VO2_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-brand-navy text-white font-semibold py-3.5 rounded-xl hover:bg-blue-900 active:scale-95 transition-all text-sm"
        >
          Continue to Test Selection →
        </button>
      </div>
    </div>
  )
}
