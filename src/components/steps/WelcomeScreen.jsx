export function WelcomeScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 py-12">
      {/* Logo mark */}
      <div className="w-20 h-20 rounded-2xl bg-brand-navy flex items-center justify-center mb-6 shadow-lg">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          {/* Clipboard body */}
          <rect x="8" y="10" width="32" height="34" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
          {/* Clipboard top clip */}
          <rect x="18" y="6" width="12" height="8" rx="2" fill="white"/>
          {/* ECG trace */}
          <polyline
            points="10,30 15,30 18,22 21,38 24,26 27,30 32,30 38,30"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-brand-navy mb-2 tracking-tight">ClinIQ Norms</h1>
      <p className="text-brand-teal font-medium mb-2">Clinical normative data at your fingertips</p>

      <p className="text-gray-400 text-xs max-w-sm mb-5 leading-relaxed">
        For use by qualified clinicians only. This tool provides normative comparisons and does not constitute clinical diagnosis or advice.
      </p>

      <p className="text-gray-500 text-sm max-w-sm mb-10 leading-relaxed">
        A fast, reference tool for physiotherapists and exercise physiologists to compare patient
        results against published normative data — no login, no data storage.
      </p>

      <button
        onClick={onStart}
        className="bg-brand-navy text-white text-base font-semibold px-8 py-4 rounded-2xl shadow-md hover:bg-blue-900 active:scale-95 transition-all min-h-[56px] w-full max-w-xs"
      >
        Start New Assessment
      </button>

      <p className="mt-8 text-xs text-gray-400">
        No patient data is stored. All data is cleared when you close this page or start a new assessment.
      </p>
    </div>
  )
}
