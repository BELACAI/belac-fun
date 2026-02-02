const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Calorie Counter</title>
    <script type="module" crossorigin src="/assets/index-CEXT-ldi.js"><\/script>
    <link rel="stylesheet" crossorigin href="/assets/index-Cbw3XDyS.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const pathname = url.pathname
    const BACKEND_URL = env.BACKEND_URL || 'https://belac-fun.up.railway.app'

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      })
    }

    // API routes - proxy to Railway backend
    if (pathname.startsWith('/api/')) {
      return proxyToBackend(request, pathname, BACKEND_URL)
    }

    // Serve index.html for SPA
    if (pathname === '/' || !pathname.includes('.')) {
      return new Response(INDEX_HTML, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Static assets handled by [site] section
    return new Response('Not found', { status: 404 })
  }
}

async function proxyToBackend(request, pathname, backendUrl) {
  const targetUrl = backendUrl + pathname

  try {
    // Read body for POST/PUT/DELETE
    let body = null
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      body = await request.text()
    }

    // Forward request to Railway backend
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body
    })

    const responseText = await backendResponse.text()

    // Return response with CORS headers
    return new Response(responseText, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  } catch (error) {
    console.error('Backend proxy error:', error)
    return new Response(JSON.stringify({
      error: 'Backend unavailable',
      message: error.message
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
