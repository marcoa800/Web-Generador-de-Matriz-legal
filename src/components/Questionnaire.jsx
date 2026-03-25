import { useState, useEffect } from 'react'
import { QUESTIONS, FIRST_QUESTION_ID } from '../data/questions.js'

export default function Questionnaire({ onComplete }) {
  const [history, setHistory] = useState([FIRST_QUESTION_ID])   // stack of question IDs
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(QUESTIONS[FIRST_QUESTION_ID])
  const [draft, setDraft] = useState('')                         // for text/radio inputs
  const [draftChecks, setDraftChecks] = useState([])            // for checkbox inputs
  const [error, setError] = useState('')

  // Sync draft when question changes
  useEffect(() => {
    const saved = answers[current.id]
    if (current.type === 'checkbox') {
      setDraftChecks(Array.isArray(saved) ? saved : [])
    } else {
      setDraft(saved ?? '')
    }
    setError('')
  }, [current.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ─────────────────────────────────────────────────────────────
  function validate() {
    if (!current.required && current.type !== 'radio') return true
    if (current.type === 'text') {
      if (!draft.trim()) { setError('Este campo es obligatorio.'); return false }
    }
    if (current.type === 'radio') {
      if (!draft) { setError('Seleccione una opción para continuar.'); return false }
    }
    if (current.type === 'checkbox') {
      if (draftChecks.length === 0) { setError('Seleccione al menos una opción.'); return false }
    }
    return true
  }

  function handleNext() {
    if (!validate()) return

    const answer = current.type === 'checkbox' ? draftChecks : draft
    const newAnswers = { ...answers, [current.id]: answer }
    setAnswers(newAnswers)

    const nextId = current.next(answer)

    if (nextId === null) {
      // Questionnaire finished
      onComplete(newAnswers)
      return
    }

    const nextQuestion = QUESTIONS[nextId]
    if (!nextQuestion) {
      console.error('[Questionnaire] Question not found:', nextId)
      onComplete(newAnswers)
      return
    }

    setHistory((h) => [...h, nextId])
    setCurrent(nextQuestion)
  }

  function handleBack() {
    if (history.length <= 1) return
    const newHistory = history.slice(0, -1)
    const prevId = newHistory[newHistory.length - 1]
    setHistory(newHistory)
    setCurrent(QUESTIONS[prevId])
  }

  // ── Checkbox helpers ────────────────────────────────────────────────────────
  function toggleCheck(value) {
    setDraftChecks((prev) => {
      if (value === 'ninguno') return prev.includes('ninguno') ? [] : ['ninguno']
      const withoutNinguno = prev.filter((v) => v !== 'ninguno')
      return withoutNinguno.includes(value)
        ? withoutNinguno.filter((v) => v !== value)
        : [...withoutNinguno, value]
    })
    setError('')
  }

  // ── Progress ────────────────────────────────────────────────────────────────
  const allIds = Object.keys(QUESTIONS)
  const progressPct = Math.round((history.length / allIds.length) * 100)
  const currentGroup = current.group ?? ''

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              {currentGroup}
            </span>
            <span className="text-xs text-slate-500">
              Paso {history.length} de ~{allIds.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progressPct, 4)}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-1 leading-snug">
            {current.label}
          </h2>
          {current.hint && (
            <p className="text-sm text-slate-500 mb-5">{current.hint}</p>
          )}
          {!current.hint && <div className="mb-5" />}

          {/* ── TEXT INPUT ─────────────────────────────────────────── */}
          {current.type === 'text' && (
            <input
              type="text"
              className="input-field"
              placeholder={current.placeholder ?? ''}
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              autoFocus
            />
          )}

          {/* ── RADIO OPTIONS ──────────────────────────────────────── */}
          {current.type === 'radio' && (
            <div className="space-y-2">
              {current.options.map((opt) => (
                <label
                  key={opt.value}
                  className={`radio-option ${draft === opt.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={current.id}
                    value={opt.value}
                    checked={draft === opt.value}
                    onChange={() => { setDraft(opt.value); setError('') }}
                    className="mt-0.5 accent-blue-700 shrink-0"
                  />
                  <span className="text-sm text-slate-700 leading-snug">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* ── CHECKBOX OPTIONS ───────────────────────────────────── */}
          {current.type === 'checkbox' && (
            <div className="space-y-2">
              {current.options.map((opt) => (
                <label
                  key={opt.value}
                  className={`checkbox-option ${draftChecks.includes(opt.value) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={draftChecks.includes(opt.value)}
                    onChange={() => toggleCheck(opt.value)}
                    className="mt-0.5 accent-blue-700 shrink-0"
                  />
                  <span className="text-sm text-slate-700 leading-snug">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={history.length <= 1}
            className="btn-secondary disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Atrás
          </button>
          <button onClick={handleNext} className="btn-primary">
            {current.next(current.type === 'checkbox' ? draftChecks : draft) === null
              ? 'Finalizar cuestionario'
              : 'Siguiente'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
