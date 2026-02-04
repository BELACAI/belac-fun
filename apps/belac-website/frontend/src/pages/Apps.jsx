import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import '../styles/Apps.css'

export default function Apps({ onAppSelect, onSelectDetail }) {
  const { publicKey } = useWallet()
  const [apps, setApps] = useState([])
  const [installedAppIds, setInstalledAppIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadApps()
    if (publicKey) {
      loadInstalledApps()
    }
  }, [publicKey])

  const loadApps = async () => {
    try {
      const res = await fetch('https://belac-fun-production.up.railway.app/api/marketplace/trending?limit=100')
      const data = await res.json()
      setApps(data.trending_apps || [])
    } catch (err) {
      console.error('Error loading apps:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadInstalledApps = async () => {
    try {
      const res = await fetch(
        `https://belac-fun-production.up.railway.app/api/users/${publicKey.toBase58()}/installed-apps`
      )
      const data = await res.json()
      setInstalledAppIds(data.installed_apps?.map(app => app.id) || [])
    } catch (err) {
      console.error('Error loading installed apps:', err)
    }
  }

  const handleInstall = async (appId) => {
    if (!publicKey) return

    try {
      const res = await fetch(
        `https://belac-fun-production.up.railway.app/api/users/${publicKey.toBase58()}/installed-apps/${appId}`,
        { method: 'POST' }
      )

      if (res.ok) {
        setInstalledAppIds([...installedAppIds, appId])
        loadInstalledApps()
      }
    } catch (err) {
      console.error('Error installing app:', err)
    }
  }

  const handleUninstall = async (appId) => {
    if (!publicKey) return

    try {
      const res = await fetch(
        `https://belac-fun-production.up.railway.app/api/users/${publicKey.toBase58()}/installed-apps/${appId}`,
        { method: 'DELETE' }
      )

      if (res.ok) {
        setInstalledAppIds(installedAppIds.filter(id => id !== appId))
      }
    } catch (err) {
      console.error('Error uninstalling app:', err)
    }
  }

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="apps-page">
      <div className="apps-header">
        <h1>Apps Marketplace</h1>
        <input
          type="text"
          className="apps-search"
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="apps-loading">Loading apps...</div>
      ) : (
        <div className="apps-grid">
          {filteredApps.map((app) => {
            const isInstalled = installedAppIds.includes(app.id)
            return (
              <div key={app.id} className="app-card">
                <div className="app-card-content">
                  <h3 className="app-card-name">{app.name}</h3>
                  <p className="app-card-desc">{app.description}</p>
                  <div className="app-card-meta">
                    <span className={`app-card-status app-status-${app.status}`}>
                      {app.status === 'live' ? 'LIVE' : app.status === 'beta' ? 'BETA' : 'COMING'}
                    </span>
                    <span className="app-card-users">{app.user_count} users</span>
                  </div>
                </div>

                <div className="app-card-actions">
                  {isInstalled ? (
                    <>
                      <button className="app-action-btn app-action-launch" onClick={() => onAppSelect(app)}>
                        LAUNCH
                      </button>
                      <button className="app-action-btn app-action-uninstall" onClick={() => handleUninstall(app.id)}>
                        UNINSTALL
                      </button>
                    </>
                  ) : (
                    <button 
                      className="app-action-btn app-action-install"
                      onClick={() => handleInstall(app.id)}
                      disabled={!publicKey || app.status === 'coming-soon'}
                    >
                      {app.status === 'coming-soon' ? 'COMING SOON' : 'INSTALL'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && filteredApps.length === 0 && (
        <div className="apps-empty">No apps found</div>
      )}
    </div>
  )
}
