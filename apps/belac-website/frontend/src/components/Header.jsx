export default function Header({ section, appName }) {
  const titles = {
    home: 'Belac OS',
    apps: 'Apps',
    conversations: 'Conversations',
    profile: 'Profile',
    app: 'App',
  }

  if (appName) {
    return (
      <header className="header">
        <h2>{appName}</h2>
      </header>
    )
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
