import { google } from 'googleapis'

/**
 * Build an authenticated Google API client using a Service Account.
 * Credentials are read from the GOOGLE_SERVICE_ACCOUNT_JSON environment variable.
 */
function getAuthClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON env var is not set.')

  let credentials
  try {
    credentials = JSON.parse(raw)
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.')
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  })
  return auth
}

// ─── Column definitions (matches geminiService prompt) ───────────────────────
const HEADERS = [
  'Item',
  'Tema',
  'Descripción del Requisito',
  'Título Norma',
  'Número Norma',
  'Artículo N°',
  'Emisor',
  'Fecha de Emisión',
  'Tipo de Requisito',
]

const ROW_KEYS = [
  'item',
  'tema',
  'descripcion_requisito',
  'titulo_norma',
  'numero_norma',
  'articulo',
  'emisor',
  'fecha_emision',
  'tipo_requisito',
]

/**
 * Creates a Google Sheets file, fills it with matrix data, sets sharing
 * permissions, and returns the public web view URL.
 *
 * @param {string} companyName   - Used as the spreadsheet title
 * @param {string} ruc           - Company RUC
 * @param {Array}  matrix        - Array of row objects from Gemini
 * @returns {Promise<string>}    - webViewLink of the created sheet
 */
export async function createMatrixSheet(companyName, ruc, matrix) {
  const auth = getAuthClient()
  const sheets = google.sheets({ version: 'v4', auth })
  const drive  = google.drive({ version: 'v3', auth })

  const title = `Matriz Legal SST — ${companyName} (${ruc}) — ${new Date().toLocaleDateString('es-PE')}`
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  // ── 1. Create Google Sheets file via Drive API (no Sheets API needed here) ─
  console.log('[Drive] Step 1: Creating spreadsheet via Drive API...')
  const fileRes = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      ...(folderId ? { parents: [folderId] } : {}),
    },
    fields: 'id',
  })

  const spreadsheetId = fileRes.data.id
  console.log('[Drive] Step 1 OK — spreadsheetId:', spreadsheetId)

  // Get sheetId from the newly created spreadsheet
  const metaRes = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties' })
  const sheetId = metaRes.data.sheets[0].properties.sheetId

  // ── 2. Write title row + headers + data ────────────────────────────────────
  console.log('[Drive] Step 2: Writing data...')
  const titleRow    = [`MATRIZ LEGAL SST — ${companyName.toUpperCase()} — RUC: ${ruc}`]
  const headerRow   = HEADERS
  const dataRows    = matrix.map((row) =>
    ROW_KEYS.map((key) => {
      const val = row[key]
      return val !== undefined && val !== null ? String(val) : ''
    })
  )

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Matriz Legal!A1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [titleRow, headerRow, ...dataRows],
    },
  })

  console.log('[Drive] Step 2 OK — data written')
  // ── 3. Format the sheet ────────────────────────────────────────────────────
  console.log('[Drive] Step 3: Formatting...')
  const lastCol      = HEADERS.length - 1      // 0-indexed
  const lastDataRow  = matrix.length + 2       // title + header + data rows

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Merge title row across all columns
        {
          mergeCells: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: HEADERS.length },
            mergeType: 'MERGE_ALL',
          },
        },
        // Title row formatting
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: HEADERS.length },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.118, green: 0.231, blue: 0.545 }, // #1e3a8a
                textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 13 },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },
        // Header row formatting
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: HEADERS.length },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.114, green: 0.306, blue: 0.847 }, // #1d4ed8
                textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 10 },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
                wrapStrategy: 'WRAP',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
          },
        },
        // Data rows - alternating colors
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId, startRowIndex: 2, endRowIndex: lastDataRow, startColumnIndex: 0, endColumnIndex: HEADERS.length }],
              booleanRule: {
                condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=MOD(ROW(),2)=1' }] },
                format: { backgroundColor: { red: 0.937, green: 0.949, blue: 1.0 } }, // very light blue
              },
            },
            index: 0,
          },
        },
        // Set column widths
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 55 }, fields: 'pixelSize' } },   // Item
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 160 }, fields: 'pixelSize' } },  // Tema
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, properties: { pixelSize: 320 }, fields: 'pixelSize' } },  // Descripción
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 }, properties: { pixelSize: 280 }, fields: 'pixelSize' } },  // Título Norma
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 }, properties: { pixelSize: 160 }, fields: 'pixelSize' } },  // Número Norma
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 5, endIndex: 6 }, properties: { pixelSize: 100 }, fields: 'pixelSize' } },  // Artículo
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 6, endIndex: 7 }, properties: { pixelSize: 120 }, fields: 'pixelSize' } },  // Emisor
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 7, endIndex: 8 }, properties: { pixelSize: 110 }, fields: 'pixelSize' } },  // Fecha
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 8, endIndex: 9 }, properties: { pixelSize: 120 }, fields: 'pixelSize' } },  // Tipo
        // Set title row height
        { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 45 }, fields: 'pixelSize' } },
        // Borders on all data
        {
          updateBorders: {
            range: { sheetId, startRowIndex: 1, endRowIndex: lastDataRow, startColumnIndex: 0, endColumnIndex: HEADERS.length },
            top:    { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
            bottom: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
            left:   { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
            right:  { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
            innerHorizontal: { style: 'SOLID', width: 1, color: { red: 0.85, green: 0.85, blue: 0.85 } },
            innerVertical:   { style: 'SOLID', width: 1, color: { red: 0.85, green: 0.85, blue: 0.85 } },
          },
        },
        // Wrap data cells
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 2, endRowIndex: lastDataRow, startColumnIndex: 0, endColumnIndex: HEADERS.length },
            cell: { userEnteredFormat: { wrapStrategy: 'WRAP', verticalAlignment: 'TOP' } },
            fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)',
          },
        },
      ],
    },
  })

  console.log('[Drive] Step 3 OK — formatted')
  // ── 4. Set sharing permissions ─────────────────────────────────────────────
  console.log('[Drive] Step 4: Setting permissions...')
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: {
      role: 'writer',     // Change to 'reader' if you want view-only
      type: 'anyone',
    },
  })

  console.log('[Drive] Step 4 OK — permissions set')
  // ── 5. Get the public link ─────────────────────────────────────────────────
  console.log('[Drive] Step 5: Getting link...')
  const linkRes = await drive.files.get({
    fileId: spreadsheetId,
    fields: 'webViewLink',
  })

  return linkRes.data.webViewLink
}
