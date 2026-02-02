import { useState, useEffect } from 'react'

const API_URL = 'https://belac-fun.up.railway.app/api/entries'

export default function CalorieCounter() {
  const [entries, setEntries] = useState([])
  const [food, setFood] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(API_URL)
      const data = await res.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
      setError('Failed to load entries. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function addEntry(e) {
    e.preventDefault()
    if (!food || !calories || !protein) {
      setError('All fields required')
      return
    }

    try {
      setError('')
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food: food.trim(),
          calories: parseFloat(calories),
          protein: parseFloat(protein)
        })
      })
      const data = await res.json()
      if (data.success) {
        setFood('')
        setCalories('')
        setProtein('')
        fetchEntries()
      } else {
        setError(data.error || 'Failed to add entry')
      }
    } catch (error) {
      console.error('Error adding entry:', error)
      setError('Failed to add entry. Try again.')
    }
  }

  async function deleteEntry(id) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      fetchEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
      setError('Failed to delete entry')
    }
  }

  const totalCalories = entries.reduce((sum, e) => sum + parseFloat(e.calories || 0), 0)
  const totalProtein = entries.reduce((sum, e) => sum + parseFloat(e.protein || 0), 0)

  return (
    <div className="section-container calorie-container">
      <div className="section-header">
        <h2>📊 Calorie Counter</h2>
        <p>Track your daily nutrition</p>
      </div>

      <form onSubmit={addEntry} className="calorie-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Food name"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            maxLength="100"
          />
          <input
            type="number"
            placeholder="Calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            step="0.1"
          />
          <input
            type="number"
            placeholder="Protein (g)"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            step="0.1"
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary">
          <span>Add Entry</span>
        </button>
      </form>

      <div className="calorie-summary">
        <h3>Today's Summary</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="stat-value">{totalCalories.toFixed(0)}</div>
            <div className="stat-label">Total Calories (kcal)</div>
          </div>
          <div className="summary-stat">
            <div className="stat-value">{totalProtein.toFixed(1)}</div>
            <div className="stat-label">Total Protein (g)</div>
          </div>
        </div>
      </div>

      <div className="calorie-entries">
        <h3>Today's Entries ({entries.length})</h3>
        {loading && <p>Loading...</p>}
        {entries.length === 0 && !loading && <p>No entries yet. Add one above!</p>}
        <ul className="entries-list">
          {entries.map((entry) => (
            <li key={entry.id} className="entry-item">
              <div className="entry-info">
                <strong>{entry.food}</strong>
                <span className="entry-details">{entry.calories} cal • {entry.protein}g protein</span>
              </div>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="btn-delete"
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
