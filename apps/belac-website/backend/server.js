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

    // Apps registry
    await pool.query(`
      CREATE TABLE IF NOT EXISTS apps (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        intent_keywords VARCHAR(255)[] DEFAULT '{}',
        worker_url VARCHAR(255),
        creator VARCHAR(255),
        status VARCHAR(50) DEFAULT 'live',
        user_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // User prompts (activity log)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_prompts (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(255),
        prompt_text TEXT NOT NULL,
        intent_category VARCHAR(100),
        app_matched VARCHAR(255),
        saved BOOLEAN DEFAULT FALSE,
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

// Calorie Counter Endpoints
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

// Seed default apps
async function seedApps() {
  const defaultApps = [
    {
      name: 'CalorieCounter',
      description: 'Track daily nutrition intake, meals, macros',
      intent_keywords: ['calories', 'nutrition', 'diet', 'track', 'food', 'health', 'fitness'],
      worker_url: 'https://calorie-counter.calebbadassbelac.workers.dev',
      creator: 'Belac',
      status: 'live',
      user_count: 234
    },
    {
      name: 'PortfolioTracker',
      description: 'Monitor Solana holdings & token performance',
      intent_keywords: ['portfolio', 'solana', 'crypto', 'holdings', 'monitor', 'assets', 'nfts'],
      worker_url: null,
      creator: 'Belac',
      status: 'beta',
      user_count: 156
    },
    {
      name: 'TodoApp',
      description: 'Create and manage tasks with deadline tracking',
      intent_keywords: ['todo', 'tasks', 'productivity', 'notes', 'list', 'deadline', 'goals'],
      worker_url: null,
      creator: 'Belac',
      status: 'beta',
      user_count: 89
    },
    {
      name: 'NotesApp',
      description: 'Write, save, and organize notes with search',
      intent_keywords: ['notes', 'write', 'document', 'memo', 'idea', 'journal', 'organize'],
      worker_url: null,
      creator: 'Belac',
      status: 'beta',
      user_count: 45
    },
    {
      name: 'ExpenseTracker',
      description: 'Log and analyze spending patterns',
      intent_keywords: ['expense', 'spending', 'budget', 'money', 'finance', 'cost', 'track'],
      worker_url: null,
      creator: 'Belac',
      status: 'coming-soon',
      user_count: 0
    },
    {
      name: 'AnalyticsDashboard',
      description: 'Real-time analytics and insights for your data',
      intent_keywords: ['analytics', 'dashboard', 'insights', 'data', 'stats', 'reporting'],
      worker_url: null,
      creator: 'Belac',
      status: 'coming-soon',
      user_count: 0
    }
  ]

  try {
    for (const app of defaultApps) {
      const exists = await pool.query('SELECT id FROM apps WHERE name = $1', [app.name])
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO apps (name, description, intent_keywords, worker_url, creator, status, user_count) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [app.name, app.description, app.intent_keywords, app.worker_url, app.creator, app.status, app.user_count]
        )
      }
    }
    console.log('Apps seeded successfully')
  } catch (error) {
    console.error('Error seeding apps:', error)
  }
}

// Seed apps on startup
seedApps()

// PHASE 1: Prompt Analysis & Smart App Discovery

// Analyze user prompt and suggest relevant apps
app.post('/api/prompts/analyze', async (req, res) => {
  const { prompt_text, wallet_address } = req.body

  if (!prompt_text || prompt_text.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt text is required' })
  }

  try {
    // Save prompt to user activity log
    if (wallet_address) {
      await pool.query(
        'INSERT INTO user_prompts (wallet_address, prompt_text) VALUES ($1, $2)',
        [wallet_address, prompt_text.trim()]
      )
    }

    // Simple intent matching: lowercase keywords
    const promptLower = prompt_text.toLowerCase()
    
    // Get all apps
    const appsResult = await pool.query('SELECT * FROM apps WHERE status IN ($1, $2)', ['live', 'beta'])
    const allApps = appsResult.rows

    // Score apps based on keyword matches
    const scored = allApps.map(app => {
      const keywords = app.intent_keywords || []
      const matches = keywords.filter(kw => promptLower.includes(kw.toLowerCase()))
      return {
        ...app,
        match_score: matches.length > 0 ? matches.length / keywords.length : 0,
        matched_keywords: matches
      }
    })

    // Sort by score and take top 3
    const suggested = scored
      .filter(app => app.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 3)

    // Infer intent category from prompt
    let intent = 'general'
    if (promptLower.includes('calor') || promptLower.includes('nutrition') || promptLower.includes('diet')) {
      intent = 'health_fitness'
    } else if (promptLower.includes('portfolio') || promptLower.includes('crypto') || promptLower.includes('solana')) {
      intent = 'crypto'
    } else if (promptLower.includes('todo') || promptLower.includes('task') || promptLower.includes('productivity')) {
      intent = 'productivity'
    } else if (promptLower.includes('note') || promptLower.includes('write') || promptLower.includes('document')) {
      intent = 'productivity'
    } else if (promptLower.includes('expense') || promptLower.includes('budget') || promptLower.includes('spending')) {
      intent = 'finance'
    }

    res.json({
      intent,
      confidence: suggested.length > 0 ? suggested[0].match_score : 0,
      suggested_apps: suggested.map(app => ({
        id: app.id,
        name: app.name,
        description: app.description,
        creator: app.creator,
        status: app.status,
        user_count: app.user_count,
        worker_url: app.worker_url,
        match_score: app.match_score.toFixed(2)
      })),
      needs_custom: suggested.length === 0,
      can_request: true
    })
  } catch (error) {
    console.error('Error analyzing prompt:', error)
    res.status(500).json({ error: 'Failed to analyze prompt' })
  }
})

// Get trending prompts and apps for marketplace discovery
app.get('/api/marketplace/trending', async (req, res) => {
  try {
    // Get trending apps (by user count)
    const appsResult = await pool.query(
      'SELECT id, name, description, creator, status, user_count, worker_url FROM apps WHERE status = $1 ORDER BY user_count DESC LIMIT 6',
      ['live']
    )

    // Get most common prompts
    const promptsResult = await pool.query(`
      SELECT prompt_text, COUNT(*) as usage_count 
      FROM user_prompts 
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY prompt_text 
      ORDER BY usage_count DESC 
      LIMIT 5
    `)

    res.json({
      trending_apps: appsResult.rows,
      trending_prompts: promptsResult.rows,
      total_apps: (await pool.query('SELECT COUNT(*) FROM apps WHERE status = $1', ['live'])).rows[0].count,
      marketplace_ready: true
    })
  } catch (error) {
    console.error('Error fetching trending:', error)
    res.json({
      trending_apps: [],
      trending_prompts: [],
      total_apps: 0,
      marketplace_ready: false
    })
  }
})

// Save user prompt as favorite
app.post('/api/user-prompts/save', async (req, res) => {
  const { wallet_address, prompt_text } = req.body

  if (!wallet_address || !prompt_text) {
    return res.status(400).json({ error: 'Wallet address and prompt text required' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO user_prompts (wallet_address, prompt_text, saved) VALUES ($1, $2, TRUE) RETURNING *',
      [wallet_address, prompt_text]
    )
    res.json({ success: true, prompt: result.rows[0] })
  } catch (error) {
    console.error('Error saving prompt:', error)
    res.status(500).json({ error: 'Failed to save prompt' })
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
