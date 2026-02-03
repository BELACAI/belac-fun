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

  // Load trending apps on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('https://belac-fun-production.up.railway.app/api/marketplace/trending')
        const data = await res.json()
        if (data.trending_apps) {
          setTrendingApps(data.trending_apps)
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
      setPrompt('') // Clear input after success
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
      setError(`${app.name} is not yet deployed. Request it to speed up development!`)
    }
  }

  return (
    <div className="home-container">
      {/* PROMPT SECTION */}
      <div className="home-prompt-section">
        <div className="home-prompt-header">
          <h1 className="home-title">What do you want to build?</h1>
          <p className="home-subtitle">Describe your intent. Belac finds or deploys the right app.</p>
        </div>

        <form onSubmit={handleSubmit} className="home-prompt-form">
          <div className="home-prompt-input-wrapper">
            <input
              type="text"
              className="home-prompt-input"
              placeholder="I want to..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="home-prompt-button"
              disabled={!prompt.trim() || loading}
            >
              {loading ? 'Analyzing...' : 'ENTER'}
            </button>
          </div>
        </form>

        {error && <div className="home-error">{error}</div>}

        {/* EXAMPLE PROMPTS */}
        {!result && (
          <div className="home-examples">
            <p className="home-examples-label">TRY THESE:</p>
            <div className="home-examples-grid">
              {examplePrompts.map((ex, i) => (
                <button
                  key={i}
                  className="home-example-button"
                  onClick={() => analyzePrompt(ex)}
                  disabled={loading}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SUGGESTED APPS SECTION */}
      {result && (
        <div className="home-results-section">
          <div className="home-results-header">
            <h2>SUGGESTED APPS</h2>
            <p className="home-results-subtitle">
              {result.suggested_apps.length > 0
                ? `${result.suggested_apps.length} matches for your intent`
                : 'No exact matches. Would you like to request a custom app?'}
            </p>
          </div>

          {result.suggested_apps.length > 0 ? (
            <div className="home-apps-grid">
              {result.suggested_apps.map((app) => (
                <div key={app.id} className="home-app-card">
                  <div className="home-app-header">
                    <h3 className="home-app-name">{app.name}</h3>
                    <span className={`home-app-status home-status-${app.status}`}>
                      {app.status === 'live' ? 'LIVE' : app.status === 'beta' ? 'BETA' : 'COMING'}
                    </span>
                  </div>

                  <p className="home-app-description">{app.description}</p>

                  <div className="home-app-meta">
                    <span className="home-app-creator">by {app.creator}</span>
                    <span className="home-app-users">{app.user_count} users</span>
                  </div>

                  <div className="home-app-actions">
                    <button
                      className="home-action-button home-action-launch"
                      onClick={() => launchApp(app)}
                      disabled={app.status === 'coming-soon'}
                    >
                      {app.status === 'coming-soon' ? 'COMING SOON' : 'LAUNCH'}
                    </button>
                    <button className="home-action-button home-action-learn">
                      LEARN MORE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="home-no-matches">
              <p>No apps match your intent yet.</p>
              <button className="home-request-button">REQUEST CUSTOM APP</button>
            </div>
          )}

          <button
            className="home-back-button"
            onClick={() => {
              setResult(null)
              setPrompt('')
            }}
          >
            ← Back to Search
          </button>
        </div>
      )}

      {/* TRENDING SECTION (when no search) */}
      {!result && trendingApps.length > 0 && (
        <div className="home-trending-section">
          <h2 className="home-trending-title">TRENDING NOW</h2>
          <div className="home-trending-grid">
            {trendingApps.map((app) => (
              <div
                key={app.id}
                className="home-trending-card"
                onClick={() => analyzePrompt(`I want to use ${app.name}`)}
              >
                <h3>{app.name}</h3>
                <p className="home-trending-users">{app.user_count} using</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
