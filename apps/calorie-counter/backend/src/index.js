const BACKEND_URL = 'https://belac-fun.up.railway.app'
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

    // Handle API routes
    if (pathname.startsWith('/api/')) {
      return proxyAPI(request, pathname)
    }

    // Serve index.html for SPA
    if (pathname === '/' || !pathname.includes('.')) {
      return new Response(INDEX_HTML, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Static assets would go here - for now 404
    return new Response('Not found', { status: 404 })
  }
}

async function proxyAPI(request, pathname) {
  const targetUrl = BACKEND_URL + pathname

  try {
    let body = null
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      body = await request.text()
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body
    })

    const responseText = await response.text()
    return new Response(responseText, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Backend error:', error)
    return new Response(JSON.stringify({
      error: 'Backend unavailable',
      details: error.message
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
