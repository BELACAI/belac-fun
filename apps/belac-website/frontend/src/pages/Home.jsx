import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import '../styles/Home.css'

export default function Home() {
  const { publicKey } = useWallet()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [trendingApps, setTrendingApps] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('https://belac-fun-production.up.railway.app/api/marketplace/trending')
        const data = await res.json()
        if (data.trending_apps) {
          setTrendingApps(data.trending_apps.slice(0, 6))
        }
      } catch (err) {
        console.error('Error fetching trending:', err)
      }
    }
    fetchTrending()
  }, [])

  const examplePrompts = [
    'I want to track my calories',
    'Build me a notes app',
    'Show my Solana portfolio',
    'Help me manage tasks',
    'What crypto tools exist?',
    'I want to track expenses'
  ]

  const analyzePrompt = async (text) => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('https://belac-fun-production.up.railway.app/api/prompts/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_text: text,
          wallet_address: publicKey?.toBase58() || null
        })
      })

      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setResult(data)
      setPrompt('')
    } catch (err) {
      setError('Failed to analyze prompt. Please try again.')
      console.error('Prompt analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    analyzePrompt(prompt)
  }

  const launchApp = (app) => {
    if (app.worker_url) {
      window.open(app.worker_url, '_blank')
    } else {
      setError(`${app.name} is not yet deployed.`)
    }
  }

  if (result) {
    return (
      <div className="home-container home-results-view">
        <div className="home-results-wrapper">
          <button className="home-back-btn" onClick={() => { setResult(null); setPrompt(''); }}>
            ← Back
          </button>

          <div className="home-results-header-section">
            <h1 className="home-results-title">Suggested Apps</h1>
            <p className="home-results-desc">
              {result.suggested_apps.length > 0
                ? `${result.suggested_apps.length} matches for your request`
                : 'No exact matches. Would you like to request a custom app?'}
            </p>
          </div>

          {result.suggested_apps.length > 0 ? (
            <div className="home-results-grid">
              {result.suggested_apps.map((app) => (
                <div key={app.id} className="home-result-card">
                  <div className="home-result-header">
                    <h2 className="home-result-name">{app.name}</h2>
                    <span className={`home-result-badge home-result-badge-${app.status}`}>
                      {app.status === 'live' ? 'LIVE' : app.status === 'beta' ? 'BETA' : 'COMING'}
                    </span>
                  </div>
                  <p className="home-result-desc-text">{app.description}</p>
                  <div className="home-result-meta">
                    <span>{app.creator}</span>
                    <span className="home-result-users">{app.user_count} users</span>
                  </div>
                  <div className="home-result-actions">
                    <button className="home-result-btn home-result-btn-launch" onClick={() => launchApp(app)} disabled={app.status === 'coming-soon'}>
                      {app.status === 'coming-soon' ? 'Coming Soon' : 'Launch'}
                    </button>
                    <button className="home-result-btn home-result-btn-learn">Learn More</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="home-results-empty">
              <p>No apps match your intent yet.</p>
              <button className="home-result-btn home-result-btn-request">Request Custom App</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">What do you want to build?</h1>
          <p className="home-hero-subtitle">Describe your intent. Belac finds or deploys the right app.</p>

          <form onSubmit={handleSubmit} className="home-hero-form">
            <div className="home-input-wrapper">
              <input
                type="text"
                className="home-input"
                placeholder="I want to..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="home-input-submit" disabled={!prompt.trim() || loading}>
                {loading ? 'Analyzing...' : 'ENTER'}
              </button>
            </div>
          </form>

          {error && <div className="home-error-box">{error}</div>}

          <div className="home-examples-section">
            <p className="home-examples-label">Try These:</p>
            <div className="home-examples-list">
              {examplePrompts.map((ex, i) => (
                <button
                  key={i}
                  className="home-example-btn"
                  onClick={() => analyzePrompt(ex)}
                  disabled={loading}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {trendingApps.length > 0 && (
        <div className="home-trending">
          <div className="home-trending-container">
            <h2 className="home-trending-title">Trending Now</h2>
            <div className="home-trending-apps">
              {trendingApps.map((app) => (
                <div key={app.id} className="home-trending-item" onClick={() => analyzePrompt(`I want to use ${app.name}`)}>
                  <h3>{app.name}</h3>
                  <p>{app.user_count} using</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
