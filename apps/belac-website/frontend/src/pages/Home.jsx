export default function Home() {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to Belac OS</h1>
        <p>The future of decentralized app deployment</p>
      </div>

      <div className="home-grid">
        <div className="feature-card">
          <h3>🚀 One-Click Deploy</h3>
          <p>Deploy apps to production in seconds, not hours</p>
        </div>

        <div className="feature-card">
          <h3>⛓️ Solana Native</h3>
          <p>Built on Solana for speed and affordability</p>
        </div>

        <div className="feature-card">
          <h3>🔒 Self-Custody</h3>
          <p>Connect your wallet, keep full control</p>
        </div>

        <div className="feature-card">
          <h3>💰 Earn Rewards</h3>
          <p>Get paid for building and maintaining apps</p>
        </div>
      </div>

      <div className="home-cta">
        <p>Ready to build something extraordinary?</p>
        <a href="https://x.com/i/communities/2013830646201024623" className="cta-link">
          Join the Community →
        </a>
      </div>
    </div>
  )
}
