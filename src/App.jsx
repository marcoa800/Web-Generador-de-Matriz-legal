import { useState } from 'react'
import Welcome from './components/Welcome.jsx'
import Questionnaire from './components/Questionnaire.jsx'
import AISummary from './components/AISummary.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import Result from './components/Result.jsx'
import { generateCompanySummary, generateLegalMatrix } from './services/geminiService.js'
import { downloadMatrixAsXlsx } from './services/xlsxService.js'

// ─── App-level state machine ────────────────────────────────────────────────
// States: welcome → questionnaire → summarizing → summary → generating → result
// ────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [stage, setStage] = useState('welcome')
  const [answers, setAnswers] = useState(null)
  const [summary, setSummary] = useState('')
  const [matrixData, setMatrixData] = useState(null)
  const [sheetUrl, setSheetUrl] = useState('')
  const [error, setError] = useState('')

  // ── STEP 1 → 2: Questionnaire completed ───────────────────────────────────
  async function handleQuestionnaireComplete(collectedAnswers) {
    setAnswers(collectedAnswers)
    setStage('summarizing')
    setError('')

    try {
      const text = await generateCompanySummary(collectedAnswers)
      setSummary(text)
      setStage('summary')
    } catch (err) {
      console.error(err)
      setError('No se pudo conectar con la IA. Verifique su API key y conexión a internet.')
      setStage('questionnaire')
    }
  }

  // ── STEP 3 → 4: User confirms summary ─────────────────────────────────────
  async function handleConfirmSummary() {
    setStage('generating')
    setError('')

    try {
      // 1. Ask Gemini to generate the full matrix JSON
      const matrix = await generateLegalMatrix(answers)
      setMatrixData(matrix)

      // 2. Generate XLSX and trigger browser download
      const fileName = downloadMatrixAsXlsx(
        answers.empresa_nombre ?? 'Empresa',
        answers.empresa_ruc ?? '',
        matrix
      )
      setSheetUrl(fileName)
      setStage('result')

    } catch (err) {
      console.error(err)
      setError(`Error al generar la matriz: ${err.message}`)
      setStage('summary') // let the user try again from the confirmation screen
    }
  }

  // ── Reset everything ───────────────────────────────────────────────────────
  function handleReset() {
    setStage('welcome')
    setAnswers(null)
    setSummary('')
    setMatrixData(null)
    setSheetUrl('')
    setError('')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="font-sans">
      {/* Global error banner */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full mx-4">
          <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl px-5 py-4 flex items-start gap-3 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-sm">Se produjo un error</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Stage renderer ── */}
      {stage === 'welcome' && (
        <Welcome onStart={() => setStage('questionnaire')} />
      )}

      {stage === 'questionnaire' && (
        <Questionnaire onComplete={handleQuestionnaireComplete} />
      )}

      {stage === 'summarizing' && (
        <LoadingSpinner
          title="Analizando su empresa..."
          subtitle="La IA está procesando sus respuestas para generar un resumen preciso."
          steps={[
            { label: 'Procesando respuestas del cuestionario', done: true, active: false },
            { label: 'Analizando perfil de riesgos y sector', done: false, active: true },
            { label: 'Generando resumen de entendimiento', done: false, active: false },
          ]}
        />
      )}

      {stage === 'summary' && (
        <AISummary
          summary={summary}
          onConfirm={handleConfirmSummary}
          onBack={() => setStage('questionnaire')}
        />
      )}

      {stage === 'generating' && (
        <LoadingSpinner
          title="Generando su Matriz Legal..."
          subtitle="Este proceso puede tardar unos segundos. No cierre esta ventana."
          steps={[
            { label: 'Identificando normativas aplicables al sector', done: false, active: true },
            { label: 'Estructurando requisitos legales (45-60 filas)', done: false, active: false },
            { label: 'Generando columna "Cómo cumplir"', done: false, active: false },
            { label: 'Construyendo archivo Excel (.xlsx)', done: false, active: false },
          ]}
        />
      )}

      {stage === 'result' && (
        <Result
          sheetUrl={sheetUrl}
          onRedownload={() => downloadMatrixAsXlsx(answers?.empresa_nombre ?? 'Empresa', answers?.empresa_ruc ?? '', matrixData)}
          companyName={answers?.empresa_nombre}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
