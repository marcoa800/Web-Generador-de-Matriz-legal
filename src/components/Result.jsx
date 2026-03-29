import { useState, useEffect } from 'react'
import { generateXlsxBlob } from '../services/xlsxService.js'
import {
  requestDriveToken,
  uploadToDrive,
  updateInDrive,
  getSavedDriveFile,
  saveDriveFile,
  parseFolderId,
} from '../services/driveService.js'

export default function Result({ sheetUrl: fileName, companyName, ruc, matrix, onReset, onRedownload }) {
  // Drive state
  const [driveStatus, setDriveStatus] = useState('idle') // idle | loading | success | error
  const [driveUrl, setDriveUrl]       = useState('')
  const [driveError, setDriveError]   = useState('')
  const [savedFile, setSavedFile]     = useState(null)
  const [folderInput, setFolderInput] = useState('')

  // Load any previously saved Drive file for this company
  useEffect(() => {
    if (ruc) {
      const saved = getSavedDriveFile(ruc)
      if (saved) {
        setSavedFile(saved)
        setDriveUrl(saved.url)
      }
    }
  }, [ruc])

  async function handleDriveAction() {
    if (!matrix) return
    setDriveStatus('loading')
    setDriveError('')

    try {
      const token = await requestDriveToken()
      const { blob, fileName: xlsxName } = generateXlsxBlob(companyName ?? 'Empresa', ruc ?? '', matrix)

      let result
      if (savedFile?.fileId) {
        // Update existing file (keep same location)
        result = await updateInDrive(token, savedFile.fileId, blob)
        result.fileId = savedFile.fileId
      } else {
        // Upload new file, optionally into a specific folder
        const folderId = parseFolderId(folderInput)
        result = await uploadToDrive(token, blob, xlsxName, folderId)
        saveDriveFile(ruc, result.fileId, result.url)
        setSavedFile({ fileId: result.fileId, url: result.url })
      }

      setDriveUrl(result.url)
      setDriveStatus('success')
    } catch (err) {
      console.error(err)
      setDriveError(err.message)
      setDriveStatus('error')
    }
  }

  const hasExisting = Boolean(savedFile?.fileId)

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
        <div className="card mb-4 text-left">
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

        {/* ── Google Drive section ─────────────────────────────────────────── */}
        <div className="card mb-6 text-left">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Google Drive
          </p>

          {driveStatus === 'idle' && !hasExisting && (
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">
                Carpeta de destino <span className="text-slate-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={folderInput}
                onChange={(e) => setFolderInput(e.target.value)}
                placeholder="Pega la URL de tu carpeta en Drive…"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-slate-300"
              />
              {folderInput && !parseFolderId(folderInput) && (
                <p className="text-xs text-red-500 mt-1">URL o ID de carpeta no válido</p>
              )}
              {folderInput && parseFolderId(folderInput) && (
                <p className="text-xs text-emerald-600 mt-1">
                  Carpeta detectada: <code className="font-mono">{parseFolderId(folderInput)}</code>
                </p>
              )}
            </div>
          )}

          {driveStatus === 'idle' && (
            <button
              onClick={handleDriveAction}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 font-semibold rounded-xl px-4 py-3 transition-all"
            >
              {/* Google Drive icon */}
              <svg viewBox="0 0 87.3 78" className="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
              {hasExisting ? 'Actualizar en Google Drive' : 'Subir a Google Drive'}
            </button>
          )}

          {driveStatus === 'loading' && (
            <div className="flex items-center justify-center gap-3 py-3">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span className="text-sm text-slate-600">
                {hasExisting ? 'Actualizando en Drive…' : 'Subiendo a Google Drive…'}
              </span>
            </div>
          )}

          {driveStatus === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  {hasExisting ? '¡Archivo actualizado en Drive!' : '¡Archivo subido a Google Drive!'}
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir en Google Sheets
                </a>
                <button
                  onClick={() => setDriveStatus('idle')}
                  className="flex items-center gap-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl px-3 py-2.5 text-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualizar
                </button>
              </div>
            </div>
          )}

          {driveStatus === 'error' && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">{driveError}</p>
              </div>
              <button
                onClick={() => setDriveStatus('idle')}
                className="text-sm text-blue-600 hover:underline"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
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
