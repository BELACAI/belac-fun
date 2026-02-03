export default function Header({ section }) {
  const titles = {
    home: 'Belac OS',
    token: 'Token',
    apps: 'Apps',
    upcoming: 'Upcoming',
    stake: 'Stake',
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
