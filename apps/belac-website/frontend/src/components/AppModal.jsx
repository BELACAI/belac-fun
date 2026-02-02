import { useEffect } from 'react'
import CalorieCounter from '../apps/CalorieCounter'
import './AppModal.css'

const APP_COMPONENTS = {
  calories: CalorieCounter,
}

export default function AppModal({ app, onClose }) {
  const AppComponent = APP_COMPONENTS[app.id]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{app.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-content">
          {AppComponent ? <AppComponent /> : <p>App loading...</p>}
        </div>
      </div>
    </div>
  )
}
