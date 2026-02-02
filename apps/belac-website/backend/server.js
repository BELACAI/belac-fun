import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000
const suggestionsFile = path.join(__dirname, 'suggestions.json')

app.use(cors())
app.use(express.json())

// Load suggestions from file
function loadSuggestions() {
  try {
    if (fs.existsSync(suggestionsFile)) {
      const data = fs.readFileSync(suggestionsFile, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading suggestions:', error)
  }
  return []
}

// Save suggestions to file
function saveSuggestions(suggestions) {
  try {
    fs.writeFileSync(suggestionsFile, JSON.stringify(suggestions, null, 2))
  } catch (error) {
    console.error('Error saving suggestions:', error)
  }
}

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
    avatar: 'https://pub-263f4927a6df4831af52e0a7236d300c.r2.dev/belacai/HAI3oicbYAAif8w.png',
    token: '$BELAC JAtS3FzpiMQMcRmPBEzsaTC9mAiprsptWPDTpoqXBAGS'
  })
})

// Get all suggestions
app.get('/api/suggestions', (req, res) => {
  const suggestions = loadSuggestions()
  res.json({ suggestions, count: suggestions.length })
})

// Post a new suggestion
app.post('/api/suggestions', (req, res) => {
  const { text } = req.body

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Suggestion text is required' })
  }

  const suggestions = loadSuggestions()
  const newSuggestion = {
    id: Date.now(),
    text: text.trim(),
    timestamp: new Date().toISOString(),
    status: 'new',
    votes: 0
  }

  suggestions.push(newSuggestion)
  saveSuggestions(suggestions)

  res.json({ success: true, suggestion: newSuggestion })
})

// Community posts endpoint
app.get('/api/community-posts', async (req, res) => {
  try {
    const posts = [
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
      },
      {
        id: '3',
        author: 'Another Member',
        handle: 'founder',
        avatar: '',
        text: 'Elon was right. AI should build apps. Belac is proving it.',
        timestamp: '45 minutes ago',
        likes: 890,
        replies: 230,
        reposts: 560
      }
    ]

    const stats = {
      totalPosts: posts.length,
      totalEngagement: posts.reduce((sum, p) => sum + p.likes + p.replies + p.reposts, 0),
      communityMembers: 500,
      topPost: posts[0]?.text || ''
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
  console.log(`Belac backend running on port ${port}`)
  console.log(`Suggestions file: ${suggestionsFile}`)
})
