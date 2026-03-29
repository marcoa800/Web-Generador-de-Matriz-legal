// ─── Google Drive Service (OAuth 2.0 – drive.file scope) ─────────────────────
// Uses Google Identity Services (GIS) to get a user token.
// Only accesses files created by this app (drive.file scope).
// File IDs are persisted in localStorage to allow updating the same sheet.

const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const STORAGE_PREFIX = 'driveFile_'

// ── Load GIS script on demand ────────────────────────────────────────────────
function loadGisScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = resolve
    document.head.appendChild(script)
  })
}

// ── Request OAuth token via popup ────────────────────────────────────────────
export async function requestDriveToken() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error(
      'Google Client ID no configurado. Agregue VITE_GOOGLE_CLIENT_ID en Vercel.'
    )
  }

  await loadGisScript()

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error_description || resp.error))
        else resolve(resp.access_token)
      },
    })
    client.requestAccessToken()
  })
}

// ── Upload XLSX blob → converts to Google Sheets in Drive ────────────────────
export async function uploadToDrive(accessToken, blob, fileName) {
  const metadata = {
    name: fileName.replace(/\.xlsx$/i, ''),
    mimeType: 'application/vnd.google-apps.spreadsheet',
  }

  const form = new FormData()
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  )
  form.append(
    'file',
    new Blob([blob], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  )

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: form }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Error Drive ${res.status}`)
  }

  const file = await res.json()
  return {
    fileId: file.id,
    url: `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
  }
}

// ── Update existing Google Sheets file (replace content) ────────────────────
export async function updateInDrive(accessToken, fileId, blob) {
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      body: blob,
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Error Drive ${res.status}`)
  }

  return { url: `https://docs.google.com/spreadsheets/d/${fileId}/edit` }
}

// ── localStorage helpers ─────────────────────────────────────────────────────
export function getSavedDriveFile(ruc) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + ruc)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveDriveFile(ruc, fileId, url) {
  localStorage.setItem(
    STORAGE_PREFIX + ruc,
    JSON.stringify({ fileId, url, savedAt: new Date().toISOString() })
  )
}
