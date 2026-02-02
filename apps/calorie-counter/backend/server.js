import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000
const dataFile = path.join(__dirname, 'entries.json')

app.use(cors())
app.use(express.json())

// Load entries
function loadEntries() {
  try {
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading entries:', error)
  }
  return []
}

// Save entries
function saveEntries(entries) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(entries, null, 2))
  } catch (error) {
    console.error('Error saving entries:', error)
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Calorie Counter' })
})

// Get all entries
app.get('/api/entries', (req, res) => {
  const entries = loadEntries()
  res.json({ entries, total: entries.length })
})

// Add entry
app.post('/api/entries', (req, res) => {
  const { food, calories, protein } = req.body

  if (!food || calories === undefined || protein === undefined) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const entries = loadEntries()
  const newEntry = {
    id: Date.now().toString(),
    food,
    calories: parseFloat(calories),
    protein: parseFloat(protein),
    timestamp: new Date().toISOString()
  }

  entries.push(newEntry)
  saveEntries(entries)

  res.json({ success: true, entry: newEntry })
})

// Delete entry
app.delete('/api/entries/:id', (req, res) => {
  const { id } = req.params
  let entries = loadEntries()

  entries = entries.filter(e => e.id !== id)
  saveEntries(entries)

  res.json({ success: true })
})

app.listen(port, () => {
  console.log(`Calorie Counter backend running on port ${port}`)
})
