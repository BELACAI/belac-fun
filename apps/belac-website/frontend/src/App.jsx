import { useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { registerMwa, createDefaultAuthorizationCache, createDefaultChainSelector, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-standard-mobile'
import '@solana/wallet-adapter-react-ui/styles.css'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Apps from './pages/Apps'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import './App.css'

export default function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [activeApp, setActiveApp] = useState(null)
  const [appDetailId, setAppDetailId] = useState(null)
  const [endpoint, setEndpoint] = useState('')

  // Initialize Solana network
  useEffect(() => {
    const selectedNetwork = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta'
    const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(selectedNetwork)
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
            <Sidebar 
              activeSection={activeSection} 
              onSelect={setActiveSection}
              activeApp={activeApp}
              onAppSelect={setActiveApp}
            />
            <div className="belac-main">
              <main className="belac-content">
                {activeApp && activeApp.worker_url && (
                  <iframe 
                    src={activeApp.worker_url} 
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title={activeApp.name}
                  />
                )}
                {!activeApp && activeSection === 'home' && <Home onNavigateToChat={() => setActiveSection('chat')} />}
                {!activeApp && activeSection === 'apps' && <Apps onAppSelect={setActiveApp} onSelectDetail={setAppDetailId} />}
                {!activeApp && activeSection === 'chat' && <Chat />}
                {!activeApp && activeSection === 'profile' && <Profile onRefreshApps={() => {}} />}
              </main>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
