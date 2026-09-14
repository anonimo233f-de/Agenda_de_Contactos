import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { pool } from './config/db.js'
import contactRoutes from './routes/contactRoutes.js'

const app = express()
const port = process.env.CONTACTS_PORT || 3002
const host = '0.0.0.0'

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.get('/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ service: 'contacts-service', database: 'postgresql', status: 'ok' })
  } catch {
    response.status(503).json({ service: 'contacts-service', database: 'unavailable', status: 'error' })
  }
})
app.use('/api/contacts', contactRoutes)
app.use((error, _request, response, _next) => {
  console.error('contacts-service:', error)
  response.status(500).json({ message: 'Error interno del microservicio de contactos' })
})

app.listen(port, host, () => {
  console.log(`contacts-service activo en http://0.0.0.0:${port}`)
  console.log(`También disponible en http://localhost:${port}`)
})
