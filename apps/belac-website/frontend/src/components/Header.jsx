import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import './Header.css'

export default function Header({ onMenuClick, activeSection }) {
  const { publicKey } = useWallet()

  return (
    <header className="belac-header">
      <div className="header-container">
        <div className="header-left">
          <button className="menu-btn" onClick={onMenuClick}>
            ☰
          </button>
          <div className="logo-area">
            <h1 className="belac-title">BELAC OS</h1>
            <p className="subtitle">App Marketplace</p>
          </div>
        </div>

        <div className="header-right">
          {publicKey && (
            <div className="wallet-info">
              {publicKey.toString().slice(0, 8)}...
            </div>
          )}
          <WalletMultiButton className="wallet-button" />
        </div>
      </div>
    </header>
  )
}
