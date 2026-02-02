import { GiToken } from 'react-icons/gi'
import { MdApps, MdSchedule, MdPerson } from 'react-icons/md'
import { BiTargetLock } from 'react-icons/bi'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import './Sidebar.css'

export default function Sidebar({ activeSection, onSelect }) {
  const { connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  const nav = [
    { id: 'token', label: 'Token', icon: GiToken },
    { id: 'apps', label: 'Apps', icon: MdApps },
    { id: 'upcoming', label: 'Upcoming', icon: MdSchedule },
    { id: 'stake', label: 'Stake', icon: BiTargetLock },
    { id: 'profile', label: 'Profile', icon: MdPerson },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">BELAC</div>
      </div>

      <nav className="nav-list">
        {nav.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
              title={item.label}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        {connected ? (
          <button className="wallet-btn" onClick={() => disconnect()}>
            Disconnect
          </button>
        ) : (
          <button className="wallet-btn" onClick={() => setVisible(true)}>
            Connect Wallet
          </button>
        )}
      </div>
    </aside>
  )
}
