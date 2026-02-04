export default function Header({ section }) {
  const titles = {
    home: 'Belac OS',
    apps: 'Apps',
    conversations: 'Conversations',
    profile: 'Profile',
  }

  return (
    <header className="header">
      {section === 'home' ? (
        <div className="header-home">
          <h1>Belac OS</h1>
        </div>
      ) : (
        <h2>{titles[section] || section}</h2>
      )}
    </header>
  )
}
