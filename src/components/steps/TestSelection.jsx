import { useState, useMemo } from 'react'
import { TESTS, CATEGORIES, ROM_SUB_GROUPS } from '../../data/tests.js'

// All selectable tests (exclude auto-computed BMI)
const SELECTABLE_TESTS = TESTS.filter(t => t.inputType !== 'auto')

function getInitialCollapsed(selectedTests) {
  const state = {}
  for (const cat of CATEGORIES) {
    const hasSelected = SELECTABLE_TESTS.some(t => t.category === cat.id && selectedTests.has(t.id))
    state[cat.id] = !hasSelected
  }
  for (const cat of CATEGORIES) {
    for (const sg of ROM_SUB_GROUPS) {
      state[`${cat.id}-${sg}`] = true
    }
  }
  return state
}

export function TestSelection({ selectedTests, onToggle, onToggleGroup, onNext, onBack }) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState(() => getInitialCollapsed(selectedTests))

  const filteredTests = useMemo(() => {
    if (!query.trim()) return SELECTABLE_TESTS
    const q = query.toLowerCase()
    return SELECTABLE_TESTS.filter(t =>
      t.label.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.romSubGroup && t.romSubGroup.toLowerCase().includes(q))
    )
  }, [query])

  function toggleCollapse(key) {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function getSubGroupTests(catId, subGroup) {
    return filteredTests.filter(t => t.category === catId && t.romSubGroup === subGroup)
  }

  function getCatTests(catId) {
    return filteredTests.filter(t => t.category === catId)
  }

  function getIds(tests) {
    return tests.map(t => t.id)
  }

  function handleSelectAll(catId) {
    onToggleGroup(getIds(getCatTests(catId)), true)
  }

  function handleDeselectAll(catId) {
    onToggleGroup(getIds(getCatTests(catId)), false)
  }

  function handleSubGroupSelect(catId, subGroup, select) {
    onToggleGroup(getIds(getSubGroupTests(catId, subGroup)), select)
  }

  const totalSelected = selectedTests.size

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Select Tests</h2>
        <p className="text-sm text-gray-500 mt-1">Choose which assessments to include in this session</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search tests..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
        />
      </div>

      {totalSelected > 0 && (
        <div className="mb-4 px-3 py-2 bg-brand-navy/5 rounded-xl">
          <span className="text-sm text-brand-navy font-medium">{totalSelected} test{totalSelected !== 1 ? 's' : ''} selected</span>
        </div>
      )}

      <div className="space-y-3">
        {CATEGORIES.map(cat => {
          const catTests = getCatTests(cat.id)
          if (catTests.length === 0) return null

          const isCollapsed = collapsed[cat.id]
          const catSelectedCount = catTests.filter(t => selectedTests.has(t.id)).length
          const catTotalCount = catTests.length

          // Determine which tests in this category have romSubGroup
          const hasSubGroups = catTests.some(t => t.romSubGroup)
          // Tests without a subGroup in this category
          const topLevelTests = catTests.filter(t => !t.romSubGroup)
          // Which subGroups are present
          const presentSubGroups = hasSubGroups
            ? ROM_SUB_GROUPS.filter(sg => catTests.some(t => t.romSubGroup === sg))
            : []

          return (
            <div key={cat.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Category header */}
              <div className="flex items-center bg-gray-50 px-4 py-3 gap-2">
                <button
                  onClick={() => toggleCollapse(cat.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <svg className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">{cat.label}</span>
                  {catSelectedCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-brand-navy text-white text-xs rounded-full">
                      {catSelectedCount}/{catTotalCount}
                    </span>
                  )}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleSelectAll(cat.id)} className="text-xs text-brand-teal font-medium hover:underline">All</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => handleDeselectAll(cat.id)} className="text-xs text-gray-500 font-medium hover:underline">None</button>
                </div>
              </div>

              {!isCollapsed && (
                <div>
                  {/* Top-level tests (no subGroup) */}
                  {topLevelTests.length > 0 && (
                    <ul className="divide-y divide-gray-100">
                      {topLevelTests.map(test => (
                        <TestRow key={test.id} test={test} checked={selectedTests.has(test.id)} onToggle={() => onToggle(test.id)} />
                      ))}
                    </ul>
                  )}

                  {/* SubGroup sections */}
                  {presentSubGroups.map(subGroup => {
                    const sgTests = getSubGroupTests(cat.id, subGroup)
                    if (sgTests.length === 0) return null
                    const sgKey = `${cat.id}-${subGroup}`
                    const sgCollapsed = collapsed[sgKey]
                    const sgSelected = sgTests.filter(t => selectedTests.has(t.id)).length

                    return (
                      <div key={subGroup} className="border-t border-gray-100">
                        {/* Sub-group header */}
                        <div className="flex items-center bg-gray-50/60 px-4 py-2 gap-2">
                          <button
                            onClick={() => toggleCollapse(sgKey)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            <svg className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${sgCollapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{subGroup}</span>
                            {sgSelected > 0 && (
                              <span className="px-1.5 py-0.5 bg-brand-navy/10 text-brand-navy text-xs rounded-full font-medium">
                                {sgSelected}/{sgTests.length}
                              </span>
                            )}
                          </button>
                          <div className="flex gap-2">
                            <button onClick={() => handleSubGroupSelect(cat.id, subGroup, true)} className="text-xs text-brand-teal font-medium hover:underline">All</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => handleSubGroupSelect(cat.id, subGroup, false)} className="text-xs text-gray-500 font-medium hover:underline">None</button>
                          </div>
                        </div>

                        {!sgCollapsed && (
                          <ul className="divide-y divide-gray-100">
                            {sgTests.map(test => (
                              <TestRow key={test.id} test={test} checked={selectedTests.has(test.id)} onToggle={() => onToggle(test.id)} indent />
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={totalSelected === 0}
          className={`flex-1 font-semibold py-3.5 rounded-xl text-sm transition-all ${
            totalSelected > 0
              ? 'bg-brand-navy text-white hover:bg-blue-900 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {totalSelected > 0 ? `Continue with ${totalSelected} test${totalSelected !== 1 ? 's' : ''} →` : 'Select at least one test'}
        </button>
      </div>
    </div>
  )
}

function TestRow({ test, checked, onToggle, indent = false }) {
  return (
    <li>
      <label className={`flex items-start gap-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${indent ? 'pl-8 pr-4' : 'px-4'}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-0.5 w-5 h-5 rounded accent-brand-navy flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{test.label}</span>
            {test.unit && <span className="text-xs text-gray-400">({test.unit})</span>}
            {test.inputType === 'notes' && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Notes only</span>
            )}
          </div>
          {test.description && (
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{test.description}</p>
          )}
          {test.ageNote && (
            <p className="text-xs text-amber-600 mt-0.5">⚑ {test.ageNote}</p>
          )}
        </div>
      </label>
    </li>
  )
}
