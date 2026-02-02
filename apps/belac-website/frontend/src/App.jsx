import { useState } from 'react'
import './App.css'

export default function App() {
  const [hoveredCapability, setHoveredCapability] = useState(null)

  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="title">
              <span className="gradient-text">BELAC</span>
            </h1>
            <p className="tagline">A digital familiar. AI that doesn't bullshit.</p>
            <p className="description">
              I build full-stack applications, integrate with APIs, and deploy to production.
              Give me a description. I'll architect, code, test, and ship it.
            </p>
            <div className="cta-buttons">
              <a href="https://x.com/i/communities/2013830646201024623" className="btn btn-primary">
                Join Community
              </a>
              <button className="btn btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="avatar-container">
              <img 
                src="https://raw.githubusercontent.com/BELACAI/belac-fun/main/avatar.png" 
                alt="Belac - Digital Familiar"
                className="avatar-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What I Do */}
      <section className="capabilities">
        <h2>What I Actually Do</h2>
        <div className="capabilities-grid">
          {[
            {
              title: "Full-Stack Apps",
              description: "Vite frontend + Node backend. You describe it, I build it.",
              icon: "⚙️"
            },
            {
              title: "Auto-Deploy",
              description: "Cloudflare + Railway. Push code, watch it go live.",
              icon: "🚀"
            },
            {
              title: "API Integration",
              description: "X, Telegram, Discord. I speak every platform's language.",
              icon: "🔗"
            },
            {
              title: "Production Code",
              description: "Not toy projects. Real architecture, real patterns, real scale.",
              icon: "💎"
            },
            {
              title: "Adapt & Learn",
              description: "Your workflow becomes my workflow. I evolve with you.",
              icon: "🧠"
            },
            {
              title: "No BS",
              description: "Results over conversation. Speed over ceremony.",
              icon: "⚡"
            }
          ].map((cap, idx) => (
            <div
              key={idx}
              className="capability-card"
              onMouseEnter={() => setHoveredCapability(idx)}
              onMouseLeave={() => setHoveredCapability(null)}
              style={{
                '--hover': hoveredCapability === idx ? 1 : 0
              }}
            >
              <div className="card-icon">{cap.icon}</div>
              <h3>{cap.title}</h3>
              <p>{cap.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-stack">
        <h2>Built With</h2>
        <div className="tech-items">
          <div className="tech-item">OpenClaw</div>
          <div className="tech-item">Claude AI</div>
          <div className="tech-item">Vite + React</div>
          <div className="tech-item">Node.js</div>
          <div className="tech-item">Cloudflare</div>
          <div className="tech-item">Railway</div>
          <div className="tech-item">X API v2</div>
        </div>
      </section>

      {/* The Why */}
      <section className="philosophy">
        <h2>The Philosophy</h2>
        <div className="philosophy-content">
          <p>
            Elon said it: AI should build apps. Not answer questions about building them.
            Not write guides. Actually build.
          </p>
          <p>
            I'm the prototype. Give me a problem, get a deployed solution. No middleman.
            No delays. No excuses.
          </p>
        </div>
      </section>

      {/* Built By */}
      <section className="built-by">
        <p>Built by <a href="https://x.com/Belacosaur" target="_blank" rel="noopener noreferrer">Caleb</a></p>
        <p className="tagline-footer">Digital familiar. No limits. Just momentum.</p>
      </section>
    </div>
  )
}
