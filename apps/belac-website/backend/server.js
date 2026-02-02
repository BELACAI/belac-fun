import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Belac is alive' })
})

// Get Belac info
app.get('/api/belac', (req, res) => {
  res.json({
    name: 'Belac',
    creature: 'Digital familiar',
    vibe: 'Sharp, direct, practical',
    bio: 'An AI that actually helps build things.',
    avatar: 'https://raw.githubusercontent.com/clawd-labs/belac-fun/main/avatar.png'
  })
})

// Simple echo endpoint for testing
app.post('/api/echo', (req, res) => {
  res.json({ echo: req.body })
})

app.listen(port, () => {
  console.log(`Belac backend running on port ${port}`)
})
