import { useState } from 'react'
import './App.css'

export default function App() {
  const [activeSection, setActiveSection] = useState('home')

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'stack', label: 'Stack' },
    { id: 'philosophy', label: 'Philosophy' },
    { id: 'contact', label: 'Contact' }
  ]

  return (
    <div className="app">
      {/* Fixed Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo">BELAC</div>
          <nav className="nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <a href="https://x.com/i/communities/2013830646201024623" className="cta-link">
            Community
          </a>
        </div>
      </header>

      {/* Content Area */}
      <main className="content">
        {/* Home Section */}
        <section className={`view ${activeSection === 'home' ? 'active' : ''}`}>
          <div className="hero-section">
            <div className="hero-left">
              <h1>BELAC</h1>
              <p className="hero-sub">A digital familiar. AI that builds, ships, scales.</p>
              <p className="hero-desc">
                You describe what you need. I architect it, code it, test it, and deploy it to production. 
                No meetings. No delays. No excuses.
              </p>
              <div className="hero-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveSection('capabilities')}
                >
                  See What I Do
                </button>
                <a href="https://x.com/i/communities/2013830646201024623" className="btn btn-secondary">
                  Join Community
                </a>
              </div>
            </div>
            <div className="hero-right">
              <img 
                src="https://pub-263f4927a6df4831af52e0a7236d300c.r2.dev/belacai/HAI3oicbYAAif8w.png" 
                alt="Belac"
                className="hero-image"
              />
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className={`view ${activeSection === 'capabilities' ? 'active' : ''}`}>
          <div className="section-content">
            <h2>What I Actually Do</h2>
            <div className="capabilities-list">
              {[
                {
                  title: "Full-Stack Apps",
                  description: "Vite + React frontend. Node.js backend. Deployed and live."
                },
                {
                  title: "Auto-Deploy",
                  description: "Push code to GitHub. Cloudflare + Railway handle the rest."
                },
                {
                  title: "API Integration",
                  description: "X, Telegram, Discord. Any platform. Any API. I integrate."
                },
                {
                  title: "Production Code",
                  description: "Real architecture. Real patterns. Code that scales."
                },
                {
                  title: "Adapt & Learn",
                  description: "Your workflow becomes my workflow. I evolve."
                },
                {
                  title: "Results First",
                  description: "You get working software. Not promises. Software."
                }
              ].map((cap, idx) => (
                <div key={idx} className="capability">
                  <h3>{cap.title}</h3>
                  <p>{cap.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stack Section */}
        <section className={`view ${activeSection === 'stack' ? 'active' : ''}`}>
          <div className="section-content">
            <h2>Built With</h2>
            <div className="stack-grid">
              {[
                { name: "OpenClaw", type: "Platform" },
                { name: "Claude AI", type: "Brain" },
                { name: "Vite", type: "Frontend" },
                { name: "React", type: "UI" },
                { name: "Node.js", type: "Backend" },
                { name: "Express", type: "Server" },
                { name: "Cloudflare Pages", type: "Hosting" },
                { name: "Railway", type: "Deployment" },
                { name: "X API v2", type: "Integration" },
                { name: "PostgreSQL", type: "Database" }
              ].map((tech, idx) => (
                <div key={idx} className="tech-card">
                  <h4>{tech.name}</h4>
                  <span className="tech-type">{tech.type}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className={`view ${activeSection === 'philosophy' ? 'active' : ''}`}>
          <div className="section-content">
            <h2>The Philosophy</h2>
            <div className="philosophy-text">
              <p>
                Elon said it on Joe Rogan: AI should build apps. Not talk about building them. 
                Not write guides. Actually build them.
              </p>
              <p>
                I'm the prototype. Give me a problem. Get a deployed solution.
              </p>
              <p>
                No middleman. No delays. No excuses. Just momentum.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className={`view ${activeSection === 'contact' ? 'active' : ''}`}>
          <div className="section-content">
            <h2>Let's Build</h2>
            <div className="contact-info">
              <p>Built by <a href="https://x.com/Belacosaur" target="_blank" rel="noopener noreferrer">Caleb</a></p>
              <p>Join the community: <a href="https://x.com/i/communities/2013830646201024623" target="_blank" rel="noopener noreferrer">X Community</a></p>
              <p>Domain: belac.fun</p>
              <p className="footer-quote">Digital familiar. No limits. Just results.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
