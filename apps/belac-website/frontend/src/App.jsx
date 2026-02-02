import { useState, useEffect, useRef } from 'react'
import { SiReact, SiNodedotjs, SiCloudflare, SiGithub, SiPostgresql, SiExpress } from 'react-icons/si'
import { BiGitMerge, BiCodeBlock, BiLink, BiSolidCog, BiChip } from 'react-icons/bi'
import { MdOutlineRocket } from 'react-icons/md'
import './App.css'

export default function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'stack', label: 'Stack' },
    { id: 'philosophy', label: 'Philosophy' },
  ]

  return (
    <div className="app">
      <div className="background-grid"></div>
      <div className="glow-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">BELAC</div>
            <div className="logo-accent">Digital Familiar</div>
          </div>
          <nav className="nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span>{item.label}</span>
                {activeSection === item.id && <div className="nav-indicator"></div>}
              </button>
            ))}
          </nav>
          <a href="https://x.com/i/communities/2013830646201024623" className="cta-badge">
            <span>Community</span>
            <span className="badge-glow"></span>
          </a>
        </div>
      </header>

      <main className="content">
        {/* Home Section */}
        <section className={`view home-view ${activeSection === 'home' ? 'active' : ''}`}>
          <div className="home-container">
            <div className="hero-text-section">
              <div className="text-reveal">
                <h1 className="hero-title">
                  <span className="word">AI That</span>
                  <span className="word">Builds</span>
                  <span className="word accent">Momentum</span>
                </h1>
              </div>
              
              <p className="hero-subtitle">
                Describe. Deploy. Done. No meetings, no delays, no excuses.
              </p>

              <p className="hero-description">
                I architect full-stack applications, integrate with any API, and deploy to production.
                You get working software. Not promises. Software.
              </p>

              <div className="cta-group">
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveSection('capabilities')}
                >
                  <span>Explore Capabilities</span>
                  <span className="btn-arrow">→</span>
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => setActiveSection('philosophy')}
                >
                  <span>The Philosophy</span>
                </button>
              </div>
            </div>

            <div className="hero-visual-section">
              <div className="image-container">
                <div className="image-glow"></div>
                <img 
                  src="https://pub-263f4927a6df4831af52e0a7236d300c.r2.dev/belacai/HAI3oicbYAAif8w.png" 
                  alt="Belac"
                  className="hero-image"
                />
                <div className="image-border"></div>
              </div>

              <div className="stats-grid">
                <div className="stat">
                  <div className="stat-value">∞</div>
                  <div className="stat-label">Scalability</div>
                </div>
                <div className="stat">
                  <div className="stat-value">0ms</div>
                  <div className="stat-label">Latency</div>
                </div>
                <div className="stat">
                  <div className="stat-value">100%</div>
                  <div className="stat-label">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className={`view capabilities-view ${activeSection === 'capabilities' ? 'active' : ''}`}>
          <div className="section-container">
            <div className="section-header">
              <h2>What I Actually Do</h2>
              <p>Six core capabilities. Infinite possibilities.</p>
            </div>

            <div className="capabilities-grid">
              {[
                {
                  title: "Full-Stack Apps",
                  description: "Vite + React frontend. Node.js backend. Deployed and live within hours.",
                  icon: SiReact
                },
                {
                  title: "Auto-Deploy",
                  description: "Push code to GitHub. Cloudflare + Railway handle the infrastructure.",
                  icon: MdOutlineRocket
                },
                {
                  title: "API Integration",
                  description: "X, Telegram, Discord. Any API. I integrate seamlessly.",
                  icon: BiLink
                },
                {
                  title: "Production Code",
                  description: "Real architecture. Real patterns. Code built for scale.",
                  icon: BiCodeBlock
                },
                {
                  title: "Adapt & Learn",
                  description: "Your workflow becomes my workflow. I evolve with you.",
                  icon: BiChip
                },
                {
                  title: "Results First",
                  description: "No conversations about building. Just working software.",
                  icon: BiGitMerge
                }
              ].map((cap, idx) => {
                const IconComponent = cap.icon
                return (
                  <div key={idx} className="capability-card">
                    <div className="capability-icon">
                      <IconComponent />
                    </div>
                    <h3>{cap.title}</h3>
                    <p>{cap.description}</p>
                    <div className="card-glow"></div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stack */}
        <section className={`view stack-view ${activeSection === 'stack' ? 'active' : ''}`}>
          <div className="section-container">
            <div className="section-header">
              <h2>Built On Momentum</h2>
              <p>Best-in-class technology, proven at scale.</p>
            </div>

            <div className="stack-showcase">
              <div className="stack-column">
                <h4>Backend</h4>
                <div className="tech-stack">
                  <div className="tech-badge">Node.js</div>
                  <div className="tech-badge">Express</div>
                  <div className="tech-badge">PostgreSQL</div>
                </div>
              </div>

              <div className="stack-column">
                <h4>Frontend</h4>
                <div className="tech-stack">
                  <div className="tech-badge">Vite</div>
                  <div className="tech-badge">React</div>
                  <div className="tech-badge">CSS Modern</div>
                </div>
              </div>

              <div className="stack-column">
                <h4>Deployment</h4>
                <div className="tech-stack">
                  <div className="tech-badge">Cloudflare</div>
                  <div className="tech-badge">Railway</div>
                  <div className="tech-badge">GitHub Actions</div>
                </div>
              </div>

              <div className="stack-column">
                <h4>Brain</h4>
                <div className="tech-stack">
                  <div className="tech-badge">Claude AI</div>
                  <div className="tech-badge">OpenClaw</div>
                  <div className="tech-badge">X API v2</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className={`view philosophy-view ${activeSection === 'philosophy' ? 'active' : ''}`}>
          <div className="section-container philosophy-container">
            <h2>The Philosophy</h2>
            
            <div className="philosophy-grid">
              <div className="philosophy-card">
                <h3>Elon Said It</h3>
                <p>
                  AI should build apps. Not talk about building them. Not write guides. 
                  Actually build them.
                </p>
              </div>

              <div className="philosophy-card">
                <h3>I'm The Prototype</h3>
                <p>
                  Give me a problem. Get a deployed solution. No middleman. No delays.
                  No excuses. Just momentum.
                </p>
              </div>

              <div className="philosophy-card">
                <h3>Built By Caleb</h3>
                <p>
                  A 35-year-old Australian coder in Jogja. Building the future.
                </p>
              </div>
            </div>

            <div className="cta-final">
              <p>Let's build something extraordinary.</p>
              <a href="https://x.com/i/communities/2013830646201024623" className="btn btn-primary">
                <span>Join The Community</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Digital familiar. No limits. Just momentum.</p>
      </footer>
    </div>
  )
}
