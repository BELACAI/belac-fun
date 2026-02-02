import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import CalorieCounter from './apps/CalorieCounter'
import Dashboard from './pages/Dashboard'
import Suggestions from './pages/Suggestions'
import './App.css'

// Solana setup
const network = clusterApiUrl('mainnet-beta')
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  const sections = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'marketplace', label: 'Apps', icon: '🚀' },
    { id: 'calories', label: 'Calories', icon: '📊' },
    { id: 'dashboard', label: 'Dashboard', icon: '📈' },
    { id: 'suggestions', label: 'Suggest', icon: '💡' },
  ]

  return (
    <ConnectionProvider endpoint={network}>
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
