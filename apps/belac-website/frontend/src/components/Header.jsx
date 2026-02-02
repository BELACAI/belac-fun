export default function Header({ section }) {
  const titles = {
    token: 'Token',
    apps: 'Apps',
    upcoming: 'Upcoming',
    stake: 'Stake',
    profile: 'Profile',
  }

  return (
    <header className="header">
      <h2>{titles[section]}</h2>
    </header>
  )
}
