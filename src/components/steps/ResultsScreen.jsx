import { useMemo } from 'react'
import { TESTS, CATEGORIES, getTestById } from '../../data/tests.js'
import { calcBMI } from '../../utils/calculations.js'
import { scoreBMI } from '../../utils/scoring.js'
import { TestCard } from '../ui/TestCard.jsx'

export function ResultsScreen({ selectedTests, demographics, results, onResultChange, onNext, onBack }) {
  const bmi = calcBMI(demographics.height, demographics.weight)
  const bmiScore = bmi ? scoreBMI(bmi) : null

  const orderedTestIds = useMemo(() => {
    const ids = []
    for (const cat of CATEGORIES) {
      if (cat.id === 'bodyComposition') ids.push('bmi')
      for (const test of TESTS) {
        if (test.category === cat.id && test.inputType !== 'auto' && selectedTests.has(test.id)) {
          ids.push(test.id)
        }
      }
    }
    return ids
  }, [selectedTests])

  const selectedCount = orderedTestIds.length

  return (
    <div className="py-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Results</h2>
        <p className="text-sm text-gray-500 mt-0.5">{selectedCount} assessment{selectedCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="pb-24">
        {orderedTestIds.map(testId => {
          if (testId === 'bmi') {
            return (
              <TestCard
                key="bmi"
                test={getTestById('bmi')}
                demographics={demographics}
                result={bmi ? { value: bmi, category: bmiScore?.category, color: bmiScore?.color } : null}
                onResultChange={() => {}}
                readonly={true}
              />
            )
          }
          const test = getTestById(testId)
          if (!test) return null
          return (
            <TestCard
              key={testId}
              test={test}
              demographics={demographics}
              result={results[testId] ?? null}
              onResultChange={v => onResultChange(testId, v)}
            />
          )
        })}
      </div>

      <div className="flex gap-3 mt-4 sticky bottom-4 z-10">
        <button
          onClick={onBack}
          className="px-5 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-brand-teal text-white font-semibold py-3.5 rounded-xl hover:bg-teal-700 active:scale-95 transition-all text-sm shadow-md"
        >
          Proceed to Export →
        </button>
      </div>
    </div>
  )
}
