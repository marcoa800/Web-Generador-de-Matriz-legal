export default function Result({ sheetUrl: fileName, companyName, onReset, onRedownload }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
          ¡Matriz descargada!
        </h1>
        <p className="text-slate-500 mb-8">
          La <strong>Matriz Legal SST</strong> de <em>{companyName || 'su empresa'}</em> se descargó
          automáticamente a su carpeta de <strong>Descargas</strong>.
        </p>

        {/* File name card */}
        <div className="card mb-6 text-left">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Archivo generado
          </p>
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-emerald-800 break-all">{fileName}</span>
          </div>
        </div>

        {/* Info box */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-700 leading-relaxed">
            Puede abrir el archivo con <strong>Microsoft Excel</strong> o subirlo a <strong>Google Drive</strong> para editarlo en línea.
            Recuerde actualizar la matriz cada vez que cambien las normativas aplicables o las actividades de su empresa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onRedownload} className="btn-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Volver a descargar
          </button>
          <button onClick={onReset} className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generar otra matriz
          </button>
        </div>
      </div>
    </div>
  )
}
