import { useState, useEffect } from 'react'
import { MdAdd, MdDelete, MdTrendingUp } from 'react-icons/md'
import './App.css'

export default function App() {
  const [entries, setEntries] = useState([])
  const [food, setFood] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries')
      if (response.ok) {
        const data = await response.json()
        setEntries(data.entries || [])
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!food.trim() || !calories || !protein) return

    setLoading(true)
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food: food.trim(),
          calories: parseFloat(calories),
          protein: parseFloat(protein)
        })
      })

      if (response.ok) {
        setFood('')
        setCalories('')
        setProtein('')
        await fetchEntries()
      }
    } catch (error) {
      console.error('Error adding entry:', error)
    }
    setLoading(false)
  }

  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`/api/entries/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchEntries()
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0)
  const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0)

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Calorie Counter</h1>
          <p>Track your daily nutrition</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Calories</div>
            <div className="stat-value">{Math.round(totalCalories)}</div>
            <div className="stat-unit">kcal</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Protein</div>
            <div className="stat-value">{totalProtein.toFixed(1)}</div>
            <div className="stat-unit">g</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Entries</div>
            <div className="stat-value">{entries.length}</div>
            <div className="stat-unit">foods</div>
          </div>
        </div>

        <form className="entry-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Food</label>
            <input
              type="text"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="e.g., Chicken Breast"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                step="0.1"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            <MdAdd /> {loading ? 'Adding...' : 'Add Entry'}
          </button>
        </form>

        <div className="entries-section">
          <h2>Today's Entries</h2>
          {entries.length === 0 ? (
            <div className="empty-state">
              <MdTrendingUp />
              <p>No entries yet. Start tracking your nutrition.</p>
            </div>
          ) : (
            <div className="entries-list">
              {entries.map(entry => (
                <div key={entry.id} className="entry-item">
                  <div className="entry-info">
                    <h3>{entry.food}</h3>
                    <div className="entry-stats">
                      <span>{entry.calories} cal</span>
                      <span>{entry.protein}g protein</span>
                    </div>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    <MdDelete />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
