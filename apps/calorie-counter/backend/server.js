import express from 'express'
import cors from 'cors'
import pg from 'pg'

const { Pool } = pg

const app = express()
const port = process.env.PORT || 3000

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:TThUlTbUwJYVDgMWWiKOgsKcbLtoNoFk@switchyard.proxy.rlwy.net:45864/railway'
})

app.use(cors())
app.use(express.json())

// Initialize database tables
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calorie_entries (
        id SERIAL PRIMARY KEY,
        food VARCHAR(255) NOT NULL,
        calories DECIMAL(10, 2) NOT NULL,
        protein DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date DATE DEFAULT CURRENT_DATE
      );
    `)
    
    console.log('Calorie Counter database initialized')
  } catch (error) {
    console.error('Database init error:', error)
  }
}

initDB()

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Calorie Counter',
    timestamp: new Date().toISOString()
  })
})

// Get all entries (today by default)
app.get('/api/entries', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, food, calories, protein, created_at FROM calorie_entries WHERE date = CURRENT_DATE ORDER BY created_at DESC'
    )
    res.json({ entries: result.rows, count: result.rows.length })
  } catch (error) {
    console.error('Error fetching entries:', error)
    res.status(500).json({ error: 'Failed to fetch entries' })
  }
})

// Add entry
app.post('/api/entries', async (req, res) => {
  const { food, calories, protein } = req.body

  if (!food || calories === undefined || protein === undefined) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO calorie_entries (food, calories, protein) VALUES ($1, $2, $3) RETURNING id, food, calories, protein, created_at',
      [food.trim(), parseFloat(calories), parseFloat(protein)]
    )
    res.json({ success: true, entry: result.rows[0] })
  } catch (error) {
    console.error('Error creating entry:', error)
    res.status(500).json({ error: 'Failed to create entry' })
  }
})

// Delete entry
app.delete('/api/entries/:id', async (req, res) => {
  const { id } = req.params

  try {
    await pool.query('DELETE FROM calorie_entries WHERE id = $1', [id])
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting entry:', error)
    res.status(500).json({ error: 'Failed to delete entry' })
  }
})

// Get entries for a specific date
app.get('/api/entries/:date', async (req, res) => {
  const { date } = req.params

  try {
    const result = await pool.query(
      'SELECT id, food, calories, protein, created_at FROM calorie_entries WHERE date = $1 ORDER BY created_at DESC',
      [date]
    )
    res.json({ entries: result.rows, count: result.rows.length })
  } catch (error) {
    console.error('Error fetching entries:', error)
    res.status(500).json({ error: 'Failed to fetch entries' })
  }
})

app.listen(port, () => {
  console.log(`Calorie Counter backend running on port ${port}`)
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected to Railway PostgreSQL' : 'Using default connection'}`)
})
