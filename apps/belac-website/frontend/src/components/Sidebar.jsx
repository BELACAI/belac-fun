import './Sidebar.css'

export default function Sidebar({ sections, activeSection, onSelect, isOpen }) {
  return (
    <aside className={`belac-sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSelect(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Belac OS v2.0</p>
        <a href="https://x.com/i/communities/2013830646201024623">Community</a>
      </div>
    </aside>
  )
}
