import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    try {
      // Health check
      if (path === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          service: 'Calorie Counter Worker',
          timestamp: new Date().toISOString()
        }), { headers: { 'Content-Type': 'application/json' } })
      }

      // Get all entries (today)
      if (path === '/api/entries' && method === 'GET') {
        const result = await pool.query(
          'SELECT id, food, calories, protein, created_at FROM calorie_entries WHERE date = CURRENT_DATE ORDER BY created_at DESC'
        )
        return new Response(JSON.stringify({ entries: result.rows, count: result.rows.length }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Add entry
      if (path === '/api/entries' && method === 'POST') {
        const { food, calories, protein } = await request.json()

        if (!food || calories === undefined || protein === undefined) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        const result = await pool.query(
          'INSERT INTO calorie_entries (food, calories, protein) VALUES ($1, $2, $3) RETURNING id, food, calories, protein, created_at',
          [food.trim(), parseFloat(calories), parseFloat(protein)]
        )

        return new Response(JSON.stringify({ success: true, entry: result.rows[0] }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Delete entry
      if (path.startsWith('/api/entries/') && method === 'DELETE') {
        const id = path.split('/').pop()
        await pool.query('DELETE FROM calorie_entries WHERE id = $1', [id])
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Get entries for specific date
      if (path.startsWith('/api/entries/') && method === 'GET') {
        const date = path.split('/').pop()
        const result = await pool.query(
          'SELECT id, food, calories, protein, created_at FROM calorie_entries WHERE date = $1 ORDER BY created_at DESC',
          [date]
        )
        return new Response(JSON.stringify({ entries: result.rows, count: result.rows.length }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}
