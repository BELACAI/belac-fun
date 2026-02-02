import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import './Marketplace.css'

const FEATURED_APPS = [
  {
    id: 'calories',
    name: 'Calorie Counter',
    category: 'Health & Fitness',
    description: 'Track your daily nutrition intake in real-time',
    icon: '📊',
    status: 'Deployed',
    url: '#calories',
    price: 'Free'
  },
  {
    id: 'todo',
    name: 'Todo App',
    category: 'Productivity',
    description: 'Manage your tasks with ease',
    icon: '✓',
    status: 'Coming Soon',
    price: 'Free',
    deployed: false
  },
  {
    id: 'notes',
    name: 'Notes',
    category: 'Productivity',
    description: 'Quick note-taking and organization',
    icon: '📝',
    status: 'Coming Soon',
    price: 'Free',
    deployed: false
  },
  {
    id: 'wallet',
    name: 'Solana Wallet Tracker',
    category: 'Crypto',
    description: 'Track Solana wallets and transactions',
    icon: '💰',
    status: 'Coming Soon',
    price: 'Free',
    deployed: false
  },
  {
    id: 'portfolio',
    name: 'Portfolio Builder',
    category: 'Creator',
    description: 'Build your online portfolio instantly',
    icon: '🎨',
    status: 'Coming Soon',
    price: 'Paid',
    deployed: false
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    category: 'Business',
    description: 'Real-time app and user analytics',
    icon: '📈',
    status: 'Coming Soon',
    price: 'Free',
    deployed: false
  }
]

const CATEGORIES = ['All', 'Health & Fitness', 'Productivity', 'Crypto', 'Creator', 'Business']

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [deployingApp, setDeployingApp] = useState(null)
  const { publicKey } = useWallet()

  const filteredApps = selectedCategory === 'All' 
    ? FEATURED_APPS 
    : FEATURED_APPS.filter(app => app.category === selectedCategory)

  const handleDeploy = async (app) => {
    if (!publicKey) {
      alert('Please connect your Solana wallet first')
      return
    }

    setDeployingApp(app.id)
    // Simulate deployment
    setTimeout(() => {
      alert(`App "${app.name}" deployment initiated!\nCheck back soon.`)
      setDeployingApp(null)
    }, 2000)
  }

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h1>🚀 App Marketplace</h1>
        <p>Deploy apps with one click. No code required.</p>
      </div>

      <div className="category-filter">
        {CATEGORIES.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="apps-grid">
        {filteredApps.map(app => (
          <div key={app.id} className="app-card">
            <div className="app-icon">{app.icon}</div>
            <h3>{app.name}</h3>
            <p className="app-category">{app.category}</p>
            <p className="app-description">{app.description}</p>
            
            <div className="app-footer">
              <span className={`status ${app.status.toLowerCase().replace(' ', '-')}`}>
                {app.status}
              </span>
              <span className="price">{app.price}</span>
            </div>

            {app.deployed ? (
              <a href={app.url} className="btn-open">Open App</a>
            ) : (
              <button
                className="btn-deploy"
                onClick={() => handleDeploy(app)}
                disabled={deployingApp === app.id || !publicKey}
              >
                {deployingApp === app.id ? 'Deploying...' : 'Deploy App'}
              </button>
            )}
          </div>
        ))}
      </div>

      {!publicKey && (
        <div className="wallet-required">
          <p>💡 Connect your Solana wallet to deploy apps</p>
        </div>
      )}
    </div>
  )
}
