import { useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { registerMwa, createDefaultAuthorizationCache, createDefaultChainSelector, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-standard-mobile'
import '@solana/wallet-adapter-react-ui/styles.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Apps from './pages/Apps'
import Upcoming from './pages/Upcoming'
import Stake from './pages/Stake'
import Profile from './pages/Profile'
import Token from './pages/Token'
import './App.css'

export default function App() {
  const [activeSection, setActiveSection] = useState('apps')
  const [endpoint, setEndpoint] = useState('')

  // Initialize Solana network
  useEffect(() => {
    const selectedNetwork = process.env.REACT_APP_SOLANA_NETWORK || 'mainnet-beta'
    const rpcUrl = process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl(selectedNetwork)
    setEndpoint(rpcUrl)
  }, [])

  // Register MWA for Android Chrome
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isAndroid = /Android/i.test(navigator.userAgent)
    const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edg|OPR|Samsung/i.test(navigator.userAgent)

    if (isAndroid && isChrome) {
      try {
        registerMwa({
          appIdentity: {
            name: 'Belac OS',
            uri: window.location.origin,
            icon: '/logo.png',
          },
          authorizationCache: createDefaultAuthorizationCache(),
          chains: ['solana:mainnet-beta', 'solana:devnet'],
          chainSelector: createDefaultChainSelector(),
          onWalletNotFound: createDefaultWalletNotFoundHandler(),
        })
      } catch (error) {
        console.error('MWA registration failed:', error)
      }
    }
  }, [])

  const wallets = []

  if (!endpoint) {
    return <div style={{ background: '#000', color: '#fff' }}>Loading...</div>
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="belac-app">
            <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
            <div className="belac-main">
              <Header section={activeSection} />
              <main className="belac-content">
                {activeSection === 'token' && <Token />}
                {activeSection === 'apps' && <Apps />}
                {activeSection === 'upcoming' && <Upcoming />}
                {activeSection === 'stake' && <Stake />}
                {activeSection === 'profile' && <Profile />}
              </main>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
