const STEPS = ['Start', 'Demographics', 'Select Tests', 'Results', 'Export']

export function ProgressBar({ currentStep }) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((label, idx) => {
            const isCompleted = idx < currentStep
            const isActive = idx === currentStep
            const isFuture = idx > currentStep

            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      isCompleted ? 'bg-brand-teal text-white' :
                      isActive    ? 'bg-brand-navy text-white' :
                                    'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`mt-1 text-xs font-medium hidden sm:block ${
                    isActive ? 'text-brand-navy' : isCompleted ? 'text-brand-teal' : 'text-gray-400'
                  }`}>
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-colors ${isCompleted ? 'bg-brand-teal' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
        <p className="sm:hidden text-center text-xs text-brand-navy font-medium mt-1">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
        </p>
      </div>
    </div>
  )
}
