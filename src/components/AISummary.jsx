export default function AISummary({ summary, onConfirm, onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Revisión del análisis</h1>
            <p className="text-sm text-slate-500">Confirme que el resumen es correcto antes de generar la matriz</p>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
              Esto es lo que he entendido sobre su empresa
            </span>
          </div>

          {/* Summary text */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            {summary.split('\n').filter(Boolean).map((paragraph, i) => (
              <p key={i} className="text-slate-700 leading-relaxed text-sm mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Info box */}
          <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-amber-700 leading-relaxed">
              Si el resumen no refleja correctamente su empresa, puede regresar al cuestionario y corregir sus respuestas.
              Si es correcto, presione <strong>"Confirmar y generar matriz"</strong> para crear el archivo en Google Drive.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Corregir respuestas
          </button>
          <button onClick={onConfirm} className="btn-success">
            Confirmar y generar matriz
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
