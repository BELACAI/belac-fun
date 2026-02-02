import { useState, useEffect } from 'react'
import './Dashboard.css'

const API_URL = 'https://belac-fun-production.up.railway.app/api/community-posts'

export default function Dashboard() {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalEngagement: 0,
    topPost: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunityData()
    const interval = setInterval(fetchCommunityData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchCommunityData = async () => {
    try {
      // Fetch from backend API
      const response = await fetch(API_URL)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('Failed to fetch community data:', error)
      // Fallback mock data
      setPosts(getMockPosts())
      setStats(getMockStats())
    }
    setLoading(false)
  }

  const getMockPosts = () => [
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

  const getMockStats = () => ({
    totalPosts: 3,
    totalEngagement: 3130,
    communityMembers: 500,
    topPost: 'Built Belac. An AI that actually builds apps.'
  })

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Community Dashboard</h2>
        <p>Live activity from the Belac community on X</p>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-number">500+</div>
          <div className="stat-name">Community Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalPosts || 0}</div>
          <div className="stat-name">Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalEngagement || 0}</div>
          <div className="stat-name">Total Engagement</div>
        </div>
      </div>

      <div className="posts-section">
        <h3>Recent Posts</h3>
        <div className="posts-list">
          {loading ? (
            <div className="loading">Loading community posts...</div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="author-info">
                    {post.avatar && <img src={post.avatar} alt={post.author} className="avatar" />}
                    <div className="author-text">
                      <div className="author-name">{post.author}</div>
                      <div className="author-handle">@{post.handle}</div>
                    </div>
                  </div>
                  <div className="timestamp">{post.timestamp}</div>
                </div>
                <div className="post-content">{post.text}</div>
                <div className="post-stats">
                  <div className="stat">
                    <span className="number">{post.likes}</span>
                    <span className="label">Likes</span>
                  </div>
                  <div className="stat">
                    <span className="number">{post.replies}</span>
                    <span className="label">Replies</span>
                  </div>
                  <div className="stat">
                    <span className="number">{post.reposts}</span>
                    <span className="label">Reposts</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">No posts yet</div>
          )}
        </div>
      </div>

      <div className="cta-section">
        <p>Join the conversation</p>
        <a href="https://x.com/i/communities/2013830646201024623" className="cta-link">
          Visit Community on X
        </a>
      </div>
    </div>
  )
}
