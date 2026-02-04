import { useState, useEffect } from 'react'
import { MdApps, MdPerson, MdHome, MdChat, MdAdd, MdExpandMore, MdExpandLess } from 'react-icons/md'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import './Sidebar.css'

export default function Sidebar({ activeSection, onSelect, activeApp, onAppSelect }) {
  const { connected, disconnect, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [installedApps, setInstalledApps] = useState([])
  const [expandApps, setExpandApps] = useState(true)
  const [loadingApps, setLoadingApps] = useState(false)

  useEffect(() => {
    if (publicKey && connected) {
      loadInstalledApps()
    } else {
      setInstalledApps([])
    }
  }, [publicKey, connected])

  const loadInstalledApps = async () => {
    setLoadingApps(true)
    try {
      const res = await fetch(
        `https://belac-fun-production.up.railway.app/api/users/${publicKey.toBase58()}/installed-apps`
      )
      const data = await res.json()
      setInstalledApps(data.installed_apps || [])
    } catch (err) {
      console.error('Error loading installed apps:', err)
    } finally {
      setLoadingApps(false)
    }
  }

  const nav = [
    { id: 'home', label: 'Home', icon: MdHome },
    { id: 'conversations', label: 'Conversations', icon: MdChat },
    { id: 'profile', label: 'Profile', icon: MdPerson },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">BELAC</div>
      </div>

      <nav className="nav-list">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id && !activeApp ? 'active' : ''}`}
              onClick={() => {
                onSelect(item.id)
                onAppSelect(null)
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Installed Apps Section */}
      {connected && (
        <div className="sidebar-apps-section">
          <div className="sidebar-apps-header">
            <button
              className="sidebar-apps-toggle"
              onClick={() => setExpandApps(!expandApps)}
            >
              {expandApps ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
              <span>Apps</span>
            </button>
            <button
              className="sidebar-apps-add"
              onClick={() => {
                onSelect('apps')
                onAppSelect(null)
              }}
              title="Browse Apps"
            >
              <MdAdd size={16} />
            </button>
          </div>

          {expandApps && (
            <div className="sidebar-apps-list">
              {loadingApps ? (
                <div className="sidebar-apps-loading">Loading...</div>
              ) : installedApps.length > 0 ? (
                installedApps.map((app) => (
                  <button
                    key={app.id}
                    className={`sidebar-app-item ${activeApp?.id === app.id ? 'active' : ''}`}
                    onClick={() => {
                      onSelect('app')
                      onAppSelect(app)
                    }}
                    title={app.name}
                  >
                    <span className="sidebar-app-name">{app.name}</span>
                  </button>
                ))
              ) : (
                <div className="sidebar-apps-empty">No apps installed</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="sidebar-footer">
        {connected ? (
          <button className="wallet-btn" onClick={() => disconnect()}>
            DISCONNECT
          </button>
        ) : (
          <button className="wallet-btn" onClick={() => setVisible(true)}>
            CONNECT WALLET
          </button>
        )}
      </div>
    </aside>
  )
}
