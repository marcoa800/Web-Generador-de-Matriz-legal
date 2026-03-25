import * as XLSX from 'xlsx'

const HEADERS = [
  'Item',
  'Área',
  'Tema',
  'Descripción del Requisito',
  'Título Norma',
  'Número Norma',
  'Artículo N°',
  'Emisor',
  'Fecha de Emisión',
  'Tipo de Requisito',
  'Cómo Cumplir',
]

const ROW_KEYS = [
  'item',
  'area',
  'tema',
  'descripcion_requisito',
  'titulo_norma',
  'numero_norma',
  'articulo',
  'emisor',
  'fecha_emision',
  'tipo_requisito',
  'como_cumplir',
]

const COL_WIDTHS = [6, 18, 28, 48, 44, 22, 14, 20, 14, 16, 55]

// Orden y color de cabecera por área
const AREA_CONFIG = {
  'SST':                  { color: '1E3A8A', textColor: 'FFFFFF' },
  'Salud Ocupacional':    { color: '065F46', textColor: 'FFFFFF' },
  'Higiene Industrial':   { color: '92400E', textColor: 'FFFFFF' },
  'Ambiental':            { color: '064E3B', textColor: 'FFFFFF' },
  'Protección Social':    { color: '4C1D95', textColor: 'FFFFFF' },
}

const AREA_ORDER = Object.keys(AREA_CONFIG)

export function downloadMatrixAsXlsx(companyName, ruc, matrix) {
  const wb = XLSX.utils.book_new()
  const dateStr = new Date().toLocaleDateString('es-PE')

  // ── 1. Hoja resumen con todas las normas ────────────────────────────────────
  addSheet(wb, 'Todas las Normas', matrix, companyName, ruc, dateStr, '1D4ED8')

  // ── 2. Una hoja por área ────────────────────────────────────────────────────
  // Agrupar por área (respetando el orden definido)
  const grouped = {}
  matrix.forEach((row) => {
    const area = row.area ?? 'Sin Área'
    if (!grouped[area]) grouped[area] = []
    grouped[area].push(row)
  })

  // Agregar en orden definido, luego cualquier área extra que Gemini haya generado
  const orderedAreas = [
    ...AREA_ORDER.filter((a) => grouped[a]?.length > 0),
    ...Object.keys(grouped).filter((a) => !AREA_ORDER.includes(a) && grouped[a]?.length > 0),
  ]

  orderedAreas.forEach((area) => {
    const config = AREA_CONFIG[area] ?? { color: '334155', textColor: 'FFFFFF' }
    // Renumerar ítems dentro de la pestaña
    const rows = grouped[area].map((row, idx) => ({ ...row, item: idx + 1 }))
    addSheet(wb, area, rows, companyName, ruc, dateStr, config.color)
  })

  // ── 3. Descargar ────────────────────────────────────────────────────────────
  const safe = companyName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').trim().replace(/\s+/g, '_')
  const fileDateStr = dateStr.replace(/\//g, '-')
  const fileName = `Matriz_Legal_SST_${safe}_${ruc}_${fileDateStr}.xlsx`

  XLSX.writeFile(wb, fileName)
  return fileName
}

// ── Construcción de cada hoja ─────────────────────────────────────────────────
function addSheet(wb, sheetName, rows, companyName, ruc, dateStr, headerColor) {
  const titleRow  = [`MATRIZ LEGAL SST — ${companyName.toUpperCase()} — RUC: ${ruc} — ${dateStr} — ${sheetName.toUpperCase()}`]
  const headerRow = HEADERS
  const dataRows  = rows.map((row) =>
    ROW_KEYS.map((key) => (row[key] !== undefined && row[key] !== null ? String(row[key]) : ''))
  )

  const ws = XLSX.utils.aoa_to_sheet([titleRow, headerRow, ...dataRows])

  ws['!cols'] = COL_WIDTHS.map((wch) => ({ wch }))
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: HEADERS.length - 1 } }]
  ws['!rows'] = [{ hpt: 36 }, { hpt: 30 }, ...dataRows.map(() => ({ hpt: 60 }))]

  // Estilo título
  const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 })
  if (ws[titleCell]) {
    ws[titleCell].s = {
      font:      { bold: true, sz: 12, color: { rgb: 'FFFFFF' }, name: 'Calibri' },
      fill:      { fgColor: { rgb: '0F172A' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border:    border(),
    }
  }

  // Estilo encabezados
  HEADERS.forEach((_, c) => {
    const cell = XLSX.utils.encode_cell({ r: 1, c })
    if (ws[cell]) {
      ws[cell].s = {
        font:      { bold: true, sz: 10, color: { rgb: 'FFFFFF' }, name: 'Calibri' },
        fill:      { fgColor: { rgb: headerColor } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border:    border(),
      }
    }
  })

  // Estilo filas de datos (colores alternos)
  for (let r = 2; r < dataRows.length + 2; r++) {
    const fillColor = r % 2 === 0 ? 'F1F5F9' : 'FFFFFF'
    for (let c = 0; c < HEADERS.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' }
      const hAlign = [0, 6, 7, 8, 9].includes(c) ? 'center' : 'left'
      ws[cellRef].s = {
        font:      { sz: 9, name: 'Calibri' },
        fill:      { fgColor: { rgb: fillColor } },
        alignment: { horizontal: hAlign, vertical: 'top', wrapText: true },
        border:    border('thin'),
      }
    }
  }

  // Nombre de hoja (máx 31 caracteres, sin caracteres especiales)
  const safeName = sheetName.replace(/[:/\\?*[\]]/g, '').slice(0, 31)
  XLSX.utils.book_append_sheet(wb, ws, safeName)
}

function border(style = 'thin') {
  const b = { style, color: { rgb: 'CBD5E1' } }
  return { top: b, bottom: b, left: b, right: b }
}
