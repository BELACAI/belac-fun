import { useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { registerMwa, createDefaultAuthorizationCache, createDefaultChainSelector, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-standard-mobile'
import '@solana/wallet-adapter-react-ui/styles.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import CalorieCounter from './apps/CalorieCounter'
import Dashboard from './pages/Dashboard'
import Suggestions from './pages/Suggestions'
import './App.css'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [network, setNetwork] = useState(WalletAdapterNetwork.Mainnet)
  const [endpoint, setEndpoint] = useState('')

  // Initialize Solana network endpoint
  useEffect(() => {
    const selectedNetwork = process.env.REACT_APP_SOLANA_NETWORK || 'mainnet-beta'
    setNetwork(selectedNetwork)
    
    const rpcUrl = process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl(selectedNetwork)
    setEndpoint(rpcUrl)
  }, [])

  // Register Mobile Wallet Adapter for Android Chrome ONLY
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isAndroid = /Android/i.test(navigator.userAgent)
    const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edg|OPR|Samsung/i.test(navigator.userAgent)

    if (isAndroid && isChrome) {
      try {
        const origin = window.location.origin
        registerMwa({
          appIdentity: {
            name: 'Belac OS',
            uri: origin,
            icon: '/belac-logo.png',
          },
          authorizationCache: createDefaultAuthorizationCache(),
          chains: ['solana:mainnet-beta', 'solana:devnet'],
          chainSelector: createDefaultChainSelector(),
          onWalletNotFound: createDefaultWalletNotFoundHandler(),
        })
        console.log('✅ Mobile Wallet Adapter registered for Android Chrome')
      } catch (error) {
        console.error('❌ MWA registration failed:', error)
      }
    }
  }, [])

  // Empty wallets array - Wallet Standard will auto-detect wallets
  // (Phantom, Solflare on desktop, Seeker via MWA on Android Chrome)
  const wallets = []

  const sections = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'marketplace', label: 'Apps', icon: '🚀' },
    { id: 'calories', label: 'Calories', icon: '📊' },
    { id: 'dashboard', label: 'Dashboard', icon: '📈' },
    { id: 'suggestions', label: 'Suggest', icon: '💡' },
  ]

  if (!endpoint) {
    return <div>Loading...</div>
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="belac-os">
            <Header 
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              activeSection={activeSection}
            />
            <div className="os-container">
              <Sidebar 
                sections={sections}
                activeSection={activeSection}
                onSelect={(id) => {
                  setActiveSection(id)
                  setSidebarOpen(false)
                }}
                isOpen={sidebarOpen}
              />
              <main className="os-main">
                {activeSection === 'home' && <Home />}
                {activeSection === 'marketplace' && <Marketplace />}
                {activeSection === 'calories' && <CalorieCounter />}
                {activeSection === 'dashboard' && <Dashboard />}
                {activeSection === 'suggestions' && <Suggestions />}
              </main>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
