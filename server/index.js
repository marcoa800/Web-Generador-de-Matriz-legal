import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createMatrixSheet } from './googleDriveService.js'

const app  = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '2mb' }))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Create Matrix Sheet ──────────────────────────────────────────────────────
app.post('/api/create-matrix', async (req, res) => {
  const { companyName, ruc, matrix } = req.body

  if (!companyName || !Array.isArray(matrix) || matrix.length === 0) {
    return res.status(400).json({ error: 'Faltan campos requeridos: companyName, matrix[]' })
  }

  try {
    const url = await createMatrixSheet(companyName, ruc ?? '', matrix)
    return res.json({ url })
  } catch (err) {
    console.error('[/api/create-matrix] Error:', err.message)
    console.error('[/api/create-matrix] Status:', err.status ?? err.code)
    console.error('[/api/create-matrix] Details:', JSON.stringify(err.errors ?? err.response?.data ?? ''))
    return res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`)
  console.log(`[server] Drive folder: ${process.env.GOOGLE_DRIVE_FOLDER_ID ?? '(not set — files saved to root)'}`)
})
