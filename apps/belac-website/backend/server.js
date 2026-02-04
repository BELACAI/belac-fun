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

    // User profiles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        wallet_address VARCHAR(255) PRIMARY KEY,
        display_name VARCHAR(255),
        bio TEXT,
        avatar_url VARCHAR(255),
        verified BOOLEAN DEFAULT FALSE,
        signature VARCHAR(255),
        installed_apps INTEGER[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Conversations (ChatGPT-style discussions)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(255) NOT NULL,
        app_id INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        message_count INT DEFAULT 0,
        last_reply_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Conversation messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL,
        wallet_address VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
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

// PHASE 2: USER PROFILES & CONVERSATIONS

// Get or create user profile
app.get('/api/profile/:wallet_address', async (req, res) => {
  const { wallet_address } = req.params

  try {
    const result = await pool.query('SELECT * FROM user_profiles WHERE wallet_address = $1', [wallet_address])
    
    if (result.rows.length === 0) {
      // Return minimal profile for new users
      return res.json({
        wallet_address,
        display_name: null,
        bio: null,
        avatar_url: null,
        verified: false,
        created_at: null,
        updated_at: null,
        is_new: true
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Create or update user profile
app.post('/api/profile', async (req, res) => {
  const { wallet_address, display_name, bio, avatar_url, signature } = req.body

  if (!wallet_address) {
    return res.status(400).json({ error: 'Wallet address required' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_profiles (wallet_address, display_name, bio, avatar_url, verified, signature, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (wallet_address) DO UPDATE SET
       display_name = COALESCE($2, user_profiles.display_name),
       bio = COALESCE($3, user_profiles.bio),
       avatar_url = COALESCE($4, user_profiles.avatar_url),
       verified = COALESCE($5, user_profiles.verified),
       signature = COALESCE($6, user_profiles.signature),
       updated_at = NOW()
       RETURNING *`,
      [wallet_address, display_name, bio, avatar_url, !!signature, signature]
    )

    res.json({ success: true, profile: result.rows[0] })
  } catch (error) {
    console.error('Error saving profile:', error)
    res.status(500).json({ error: 'Failed to save profile' })
  }
})

// Get user's conversations
app.get('/api/conversations/user/:wallet_address', async (req, res) => {
  const { wallet_address } = req.params

  try {
    const result = await pool.query(
      `SELECT c.*, u.display_name, u.avatar_url, a.name as app_name
       FROM conversations c
       LEFT JOIN user_profiles u ON c.wallet_address = u.wallet_address
       LEFT JOIN apps a ON c.app_id = a.id
       WHERE c.wallet_address = $1
       ORDER BY c.last_reply_at DESC`,
      [wallet_address]
    )

    res.json({ conversations: result.rows, count: result.rows.length })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

// Get all conversations (trending/community)
app.get('/api/conversations', async (req, res) => {
  try {
    const limit = req.query.limit || 20
    const result = await pool.query(
      `SELECT c.*, u.display_name, u.avatar_url, a.name as app_name,
              (SELECT COUNT(*) FROM conversation_messages WHERE conversation_id = c.id) as reply_count
       FROM conversations c
       LEFT JOIN user_profiles u ON c.wallet_address = u.wallet_address
       LEFT JOIN apps a ON c.app_id = a.id
       ORDER BY c.last_reply_at DESC
       LIMIT $1`,
      [limit]
    )

    res.json({ conversations: result.rows, count: result.rows.length })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.json({ conversations: [], count: 0 })
  }
})

// Create new conversation
app.post('/api/conversations', async (req, res) => {
  const { wallet_address, app_id, title, description } = req.body

  if (!wallet_address || !title) {
    return res.status(400).json({ error: 'Wallet address and title required' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO conversations (wallet_address, app_id, title, description, message_count)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING *`,
      [wallet_address, app_id || null, title, description || '']
    )

    res.json({ success: true, conversation: result.rows[0] })
  } catch (error) {
    console.error('Error creating conversation:', error)
    res.status(500).json({ error: 'Failed to create conversation' })
  }
})

// Get conversation with messages
app.get('/api/conversations/:id', async (req, res) => {
  const { id } = req.params

  try {
    const convResult = await pool.query(
      `SELECT c.*, u.display_name, u.avatar_url, a.name as app_name
       FROM conversations c
       LEFT JOIN user_profiles u ON c.wallet_address = u.wallet_address
       LEFT JOIN apps a ON c.app_id = a.id
       WHERE c.id = $1`,
      [id]
    )

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    const messagesResult = await pool.query(
      `SELECT m.*, u.display_name, u.avatar_url
       FROM conversation_messages m
       LEFT JOIN user_profiles u ON m.wallet_address = u.wallet_address
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    )

    res.json({
      conversation: convResult.rows[0],
      messages: messagesResult.rows,
      message_count: messagesResult.rows.length
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    res.status(500).json({ error: 'Failed to fetch conversation' })
  }
})

// Add message to conversation
app.post('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params
  const { wallet_address, message } = req.body

  if (!wallet_address || !message) {
    return res.status(400).json({ error: 'Wallet address and message required' })
  }

  try {
    const messageResult = await pool.query(
      `INSERT INTO conversation_messages (conversation_id, wallet_address, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, wallet_address, message]
    )

    // Update conversation last_reply_at
    await pool.query(
      'UPDATE conversations SET last_reply_at = NOW() WHERE id = $1',
      [id]
    )

    res.json({ success: true, message: messageResult.rows[0] })
  } catch (error) {
    console.error('Error posting message:', error)
    res.status(500).json({ error: 'Failed to post message' })
  }
})

// INSTALLED APPS MANAGEMENT

// Get user's installed apps
app.get('/api/users/:wallet_address/installed-apps', async (req, res) => {
  const { wallet_address } = req.params

  try {
    const profileRes = await pool.query('SELECT installed_apps FROM user_profiles WHERE wallet_address = $1', [wallet_address])
    const installedAppIds = profileRes.rows.length > 0 ? profileRes.rows[0].installed_apps || [] : []

    if (installedAppIds.length === 0) {
      return res.json({ installed_apps: [], count: 0 })
    }

    // Get app details for each installed app
    const appsRes = await pool.query('SELECT * FROM apps WHERE id = ANY($1)', [installedAppIds])

    res.json({ installed_apps: appsRes.rows, count: appsRes.rows.length })
  } catch (error) {
    console.error('Error fetching installed apps:', error)
    res.json({ installed_apps: [], count: 0 })
  }
})

// Install an app
app.post('/api/users/:wallet_address/installed-apps/:app_id', async (req, res) => {
  const { wallet_address, app_id } = req.params

  try {
    const appIdNum = parseInt(app_id)

    // Get current installed apps
    const profileRes = await pool.query('SELECT installed_apps FROM user_profiles WHERE wallet_address = $1', [wallet_address])

    let installedApps = profileRes.rows.length > 0 ? profileRes.rows[0].installed_apps || [] : []

    // Add app if not already installed
    if (!installedApps.includes(appIdNum)) {
      installedApps = [...installedApps, appIdNum]
    }

    // Update user profile
    await pool.query('UPDATE user_profiles SET installed_apps = $1 WHERE wallet_address = $2', [installedApps, wallet_address])

    res.json({ success: true, installed_apps: installedApps })
  } catch (error) {
    console.error('Error installing app:', error)
    res.status(500).json({ error: 'Failed to install app' })
  }
})

// Uninstall an app
app.delete('/api/users/:wallet_address/installed-apps/:app_id', async (req, res) => {
  const { wallet_address, app_id } = req.params

  try {
    const appIdNum = parseInt(app_id)

    // Get current installed apps
    const profileRes = await pool.query('SELECT installed_apps FROM user_profiles WHERE wallet_address = $1', [wallet_address])

    let installedApps = profileRes.rows.length > 0 ? profileRes.rows[0].installed_apps || [] : []

    // Remove app
    installedApps = installedApps.filter(id => id !== appIdNum)

    // Update user profile
    await pool.query('UPDATE user_profiles SET installed_apps = $1 WHERE wallet_address = $2', [installedApps, wallet_address])

    res.json({ success: true, installed_apps: installedApps })
  } catch (error) {
    console.error('Error uninstalling app:', error)
    res.status(500).json({ error: 'Failed to uninstall app' })
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
