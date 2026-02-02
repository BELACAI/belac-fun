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
    avatar: 'https://pub-263f4927a6df4831af52e0a7236d300c.r2.dev/belacai/HAI3oicbYAAif8w.png'
  })
})

// Community posts endpoint
app.get('/api/community-posts', async (req, res) => {
  try {
    // TODO: Fetch from X API community
    // For now, return mock data
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
})
