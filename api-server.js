// Lokal dev-server för API-funktioner (ersätter vercel dev)
// Kör: node api-server.js

import 'dotenv/config'
import http from 'node:http'
import { readdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const PORT = 3002

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  // Matcha /api/<name>
  const match = req.url.match(/^\/api\/([a-z-]+)/)
  if (!match) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Not found' }))
  }

  const fnName = match[1]
  const fnPath = path.resolve(`api/${fnName}.js`)

  try {
    const mod = await import(pathToFileURL(fnPath).href)
    const handler = mod.default

    // Parsa body
    let body = ''
    for await (const chunk of req) body += chunk
    const parsed = body ? JSON.parse(body) : {}

    // Simulera Vercel req/res
    const fakeReq = { method: req.method, body: parsed }
    const fakeRes = {
      statusCode: 200,
      _headers: { 'Content-Type': 'application/json' },
      status(code) { this.statusCode = code; return this },
      setHeader(k, v) { this._headers[k] = v; return this },
      json(data) {
        res.writeHead(this.statusCode, this._headers)
        res.end(JSON.stringify(data))
      },
    }

    await handler(fakeReq, fakeRes)
  } catch (err) {
    console.error(`Fel i /api/${fnName}:`, err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err.message }))
  }
})

server.listen(PORT, () => {
  console.log(`API-server redo på http://localhost:${PORT}`)
})
