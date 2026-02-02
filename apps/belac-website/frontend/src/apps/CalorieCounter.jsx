import { useState, useEffect } from 'react'
import './CalorieCounter.css'

const API_URL = 'https://belac-fun-production.up.railway.app/api/entries'

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
      setError('Failed to load entries.')
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
      setError('Failed to add entry.')
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
    <div className="calorie-app">
      <form onSubmit={addEntry} className="entry-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Food"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            maxLength="50"
          />
          <input
            type="number"
            placeholder="Cal"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            step="0.1"
          />
          <input
            type="number"
            placeholder="Protein"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            step="0.1"
          />
          <button type="submit">Add</button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>

      <div className="stats">
        <div>Calories: {totalCalories.toFixed(0)} kcal</div>
        <div>Protein: {totalProtein.toFixed(1)}g</div>
      </div>

      <div className="entries">
        {loading ? (
          <p>Loading...</p>
        ) : entries.length === 0 ? (
          <p>No entries yet</p>
        ) : (
          <table>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="entry-row">
                  <td>{entry.food}</td>
                  <td>{entry.calories} cal</td>
                  <td>{entry.protein}g</td>
                  <td>
                    <button onClick={() => deleteEntry(entry.id)} className="delete-btn">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
