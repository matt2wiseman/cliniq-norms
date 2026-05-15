import { useState, useCallback, useEffect } from 'react'
import { ProgressBar } from './components/ui/ProgressBar.jsx'
import { WelcomeScreen } from './components/steps/WelcomeScreen.jsx'
import { DemographicsForm } from './components/steps/DemographicsForm.jsx'
import { TestSelection } from './components/steps/TestSelection.jsx'
import { ResultsScreen } from './components/steps/ResultsScreen.jsx'
import { ExportScreen } from './components/steps/ExportScreen.jsx'

const INITIAL_DEMOGRAPHICS = {
  age: '',
  sex: '',
  height: '',
  weight: '',
  smoker: false,
  betablockers: false,
  hrMaxFormula: 'tanaka',
  bodyFatMethod: 'skinfold',
  vo2maxMethod: 'indirect',
}

function SplashScreen({ fading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-navy transition-opacity duration-300"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <rect x="8" y="10" width="32" height="34" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
          <rect x="18" y="6" width="12" height="8" rx="2" fill="white"/>
          <polyline
            points="10,30 15,30 18,22 21,38 24,26 27,30 32,30 38,30"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">ClinIQ Norms</h1>
      <p className="text-white/60 text-sm mt-1">Clinical normative data tool</p>
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 400)
    const hideTimer = setTimeout(() => setShowSplash(false), 700)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])
  const [demographics, setDemographics] = useState(INITIAL_DEMOGRAPHICS)
  const [selectedTests, setSelectedTests] = useState(new Set())
  const [results, setResults] = useState({})

  const handleUpdateDemographics = useCallback(patch => {
    setDemographics(prev => ({ ...prev, ...patch }))
  }, [])

  const handleToggleTest = useCallback(testId => {
    setSelectedTests(prev => {
      const next = new Set(prev)
      if (next.has(testId)) next.delete(testId)
      else next.add(testId)
      return next
    })
  }, [])

  const handleToggleGroup = useCallback((ids, add) => {
    setSelectedTests(prev => {
      const next = new Set(prev)
      for (const id of ids) {
        if (add) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }, [])

  const handleUpdateResult = useCallback((testId, value) => {
    setResults(prev => ({ ...prev, [testId]: value }))
  }, [])

  const handleNewClient = useCallback(() => {
    setStep(0)
    setDemographics(INITIAL_DEMOGRAPHICS)
    setSelectedTests(new Set())
    setResults({})
  }, [])

  const showProgress = step > 0

  return (
    <div className="min-h-screen bg-surface">
      {showSplash && <SplashScreen fading={splashFading} />}
      {showProgress && <ProgressBar currentStep={step} />}

      <main className="max-w-2xl mx-auto px-4">
        {step === 0 && (
          <WelcomeScreen onStart={() => setStep(1)} />
        )}

        {step === 1 && (
          <DemographicsForm
            demographics={demographics}
            onUpdate={handleUpdateDemographics}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <TestSelection
            selectedTests={selectedTests}
            onToggle={handleToggleTest}
            onToggleGroup={handleToggleGroup}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ResultsScreen
            selectedTests={selectedTests}
            demographics={demographics}
            results={results}
            onResultChange={handleUpdateResult}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <ExportScreen
            demographics={demographics}
            selectedTests={selectedTests}
            results={results}
            onNewClient={handleNewClient}
            onBack={() => setStep(3)}
          />
        )}
      </main>
    </div>
  )
}
