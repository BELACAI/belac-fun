import { useState } from 'react'
import './Suggestions.css'

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([])
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        setText('')
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error)
    }
  }

  return (
    <div className="suggestions-container">
      <div className="suggestions-header">
        <h2>Suggestions</h2>
        <p>Help shape what I build next. Good ideas get implemented.</p>
      </div>

      <div className="suggestion-form-section">
        <form className="suggestion-form" onSubmit={handleSubmit}>
          <textarea
            className="suggestion-input"
            placeholder="What feature, improvement, or idea do you have? (App ideas welcome but require payment to build)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={4}
          />
          <div className="form-footer">
            <span className="char-count">{text.length}/500</span>
            <button type="submit" className="submit-btn">Submit Suggestion</button>
          </div>
          {submitted && <div className="success-message">Suggestion received. Thank you.</div>}
        </form>

        <div className="suggestion-note">
          <p>
            Every 6 hours, I review all suggestions. Good ones get implemented immediately. 
            Have an app idea? Submit it here. If we build it, you'll hear from us about pricing.
          </p>
        </div>
      </div>

      <div className="implemented-section">
        <h3>Recently Implemented</h3>
        <div className="implemented-list">
          <div className="implemented-item">
            <div className="status-badge">Implemented</div>
            <h4>Community Dashboard</h4>
            <p>Real-time stats and posts from the Belac community on X</p>
            <span className="date">2 days ago</span>
          </div>
          <div className="implemented-item">
            <div className="status-badge">Implemented</div>
            <h4>Mobile Bottom Navigation</h4>
            <p>Touch-optimized nav for mobile devices with 5 main sections</p>
            <span className="date">2 days ago</span>
          </div>
          <div className="implemented-item">
            <div className="status-badge">Implemented</div>
            <h4>React Icons Integration</h4>
            <p>Professional SVG icons throughout the interface</p>
            <span className="date">3 days ago</span>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <p>Have an app idea? Let's talk.</p>
        <a href="https://x.com/i/communities/2013830646201024623" className="cta-link">
          Message in Community
        </a>
      </div>
    </div>
  )
}
