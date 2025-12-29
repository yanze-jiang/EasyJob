import express from 'express'
import cors from 'cors'
import { config } from './config/env'
import routes from './routes'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', routes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EasyJob backend is running' })
})

// Start server
const PORT = config.PORT || 4000

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📝 Health check: http://localhost:${PORT}/health`)
  console.log(`🔌 API endpoint: http://localhost:${PORT}/api`)
})

export default app

