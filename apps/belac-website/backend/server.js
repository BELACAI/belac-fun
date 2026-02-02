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
      CREATE TABLE IF NOT EXISTS belac_suggestions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'new',
        votes INT DEFAULT 0
      );
    `)
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS belac_community_posts (
        id SERIAL PRIMARY KEY,
        author_id VARCHAR(255),
        content TEXT NOT NULL,
        engagement INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    
    console.log('Database initialized')
  } catch (error) {
    console.error('Database init error:', error)
  }
}

initDB()

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Belac website backend is alive',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  })
})

// Get Belac info
app.get('/api/belac', (req, res) => {
  res.json({
    name: 'Belac',
    creature: 'Digital familiar',
    vibe: 'Sharp, direct, practical',
    bio: 'An AI that actually helps build things.',
    avatar: 'https://pub-263f4927a6df4831af52e0a7236d300c.r2.dev/belacai/HAI3oicbYAAif8w.png',
    token: '$BELAC JAtS3FzpiMQMcRmPBEzsaTC9mAiprsptWPDTpoqXBAGS'
  })
})

// Get all suggestions
app.get('/api/suggestions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM belac_suggestions ORDER BY timestamp DESC')
    res.json({ suggestions: result.rows, count: result.rows.length })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    res.status(500).json({ error: 'Failed to fetch suggestions' })
  }
})

// Post a new suggestion
app.post('/api/suggestions', async (req, res) => {
  const { text } = req.body

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Suggestion text is required' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO belac_suggestions (text) VALUES ($1) RETURNING *',
      [text.trim()]
    )
    res.json({ success: true, suggestion: result.rows[0] })
  } catch (error) {
    console.error('Error creating suggestion:', error)
    res.status(500).json({ error: 'Failed to create suggestion' })
  }
})

// Community posts endpoint
app.get('/api/community-posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM belac_community_posts ORDER BY created_at DESC LIMIT 10')
    
    const posts = result.rows.length > 0 ? result.rows : [
      {
        id: '1',
        author: 'Caleb',
        handle: 'Belacosaur',
        avatar: 'https://pub-263f4927a6df4831af52e0a7236d300c.r2.dev/belacai/HAI3oicbYAAif8w.png',
        text: 'Built Belac. An AI that actually builds apps. No bullshit.',
        timestamp: '2 hours ago',
        likes: 1250,
        replies: 340,
        reposts: 890
      },
      {
        id: '2',
        author: 'Community Member',
        handle: 'developer',
        avatar: '',
        text: 'This is insane. Real apps, deployed instantly. This is the future.',
        timestamp: '1 hour ago',
        likes: 450,
        replies: 120,
        reposts: 320
      }
    ]

    const stats = {
      totalPosts: posts.length,
      totalEngagement: posts.reduce((sum, p) => sum + (p.likes || 0) + (p.replies || 0) + (p.reposts || 0), 0),
      communityMembers: 500
    }

    res.json({ posts, stats })
  } catch (error) {
    console.error('Error fetching community posts:', error)
    res.json({
      posts: [],
      stats: { totalPosts: 0, totalEngagement: 0, communityMembers: 0 }
    })
  }
})

// Simple echo endpoint for testing
app.post('/api/echo', (req, res) => {
  res.json({ echo: req.body })
})

app.listen(port, () => {
  console.log(`Belac website backend running on port ${port}`)
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected to Railway PostgreSQL' : 'Using default connection'}`)
})
