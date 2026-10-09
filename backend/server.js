import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import tournamentRoutes from './routes/tournamentRoutes.js'
import turfRoutes from './routes/turfRoutes.js'
import errorHandler from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tournament Hobe backend is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/turfs', turfRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`)
})
