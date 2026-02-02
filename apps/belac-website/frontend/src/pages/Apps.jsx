import { useState } from 'react'
import { FiPackage, FiPlus } from 'react-icons/fi'
import AppModal from '../components/AppModal'
import './Apps.css'

// Only real deployed apps
const APPS = [
  {
    id: 'calories',
    name: 'Calories',
    status: 'Live',
    url: '#',
  },
]

export default function Apps() {
  const [selectedApp, setSelectedApp] = useState(null)
  const [showRequest, setShowRequest] = useState(false)

  return (
    <div className="apps-page">
      <div className="apps-grid">
        {APPS.map(app => (
          <button
            key={app.id}
            className="app-tile"
            onClick={() => setSelectedApp(app)}
          >
            <FiPackage size={32} />
            <div className="app-info">
              <div className="app-name">{app.name}</div>
              <div className="app-status">{app.status}</div>
            </div>
          </button>
        ))}

        <button
          className="app-tile request-tile"
          onClick={() => setShowRequest(!showRequest)}
        >
          <FiPlus size={32} />
          <div className="app-info">
            <div className="app-name">Request App</div>
          </div>
        </button>
      </div>

      {showRequest && (
        <div className="request-section">
          <h3>Request an App</h3>
          <textarea
            placeholder="Describe the app you'd like to see..."
            className="request-input"
            rows={4}
          />
          <button className="request-btn">Submit Request</button>
        </div>
      )}

      {selectedApp && (
        <AppModal app={selectedApp} onClose={() => setSelectedApp(null)} />
      )}
    </div>
  )
}
