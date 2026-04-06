import fs from 'node:fs'
import http from 'node:http'
import { URL } from 'node:url'
import path from 'node:path'
import process from 'node:process'
import chatHandler from '../api/chat.js'
import assetTokenHandler from '../api/asset-token.js'
import secureAssetHandler from '../api/secure-asset.js'
import contactHandler from '../api/contact.js'

const API_PORT = Number(process.env.LOCAL_API_PORT || 8787)
const MAX_BODY_SIZE_BYTES = 1_000_000

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) {
      continue
    }

    const equalsIndex = line.indexOf('=')

    if (equalsIndex === -1) {
      continue
    }

    const key = line.slice(0, equalsIndex).trim()
    const value = line.slice(equalsIndex + 1).trim()

    if (!key || process.env[key]) {
      continue
    }

    process.env[key] = value
  }
}

function parseQuery(searchParams) {
  const query = {}

  for (const [key, value] of searchParams.entries()) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      if (Array.isArray(query[key])) {
        query[key].push(value)
      } else {
        query[key] = [query[key], value]
      }
    } else {
      query[key] = value
    }
  }

  return query
}

function normalizeHeaders(headers) {
  const normalized = {}

  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      normalized[key.toLowerCase()] = value.join(',')
    } else if (typeof value === 'string') {
      normalized[key.toLowerCase()] = value
    }
  }

  return normalized
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let totalSize = 0

    req.on('data', (chunk) => {
      totalSize += chunk.length

      if (totalSize > MAX_BODY_SIZE_BYTES) {
        reject(new Error('Request body too large'))
        req.destroy()
        return
      }

      chunks.push(chunk)
    })

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })

    req.on('error', reject)
  })
}

function isBodyTooLargeError(error) {
  return (
    error instanceof Error &&
    typeof error.message === 'string' &&
    error.message.toLowerCase().includes('too large')
  )
}

function createResponseAdapter(nodeRes) {
  let statusCode = 200
  const headers = {}
  let ended = false

  const writeHead = () => {
    if (!nodeRes.headersSent) {
      nodeRes.writeHead(statusCode, headers)
    }
  }

  return {
    setHeader(name, value) {
      headers[name] = value
    },
    status(code) {
      statusCode = code
      return this
    },
    json(payload) {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json; charset=utf-8'
      }

      const serialized = JSON.stringify(payload)

      writeHead()
      nodeRes.end(serialized)
      ended = true

      return this
    },
    end(payload) {
      writeHead()
      nodeRes.end(payload)
      ended = true

      return this
    },
    get ended() {
      return ended
    },
  }
}

async function dispatchHandler(nodeReq, nodeRes) {
  const requestUrl = new URL(nodeReq.url || '/', 'http://localhost')
  const pathname = requestUrl.pathname

  let handler

  if (pathname === '/api/chat') {
    handler = chatHandler
  } else if (pathname === '/api/contact') {
    handler = contactHandler
  } else if (pathname === '/api/asset-token') {
    handler = assetTokenHandler
  } else if (pathname === '/api/secure-asset') {
    handler = secureAssetHandler
  } else {
    nodeRes.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
    nodeRes.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  try {
    const rawBody = await readBody(nodeReq)

    const req = {
      method: nodeReq.method || 'GET',
      headers: normalizeHeaders(nodeReq.headers),
      query: parseQuery(requestUrl.searchParams),
      body: rawBody || {},
      socket: {
        remoteAddress: nodeReq.socket?.remoteAddress || '127.0.0.1',
      },
    }

    const res = createResponseAdapter(nodeRes)

    await handler(req, res)

    if (!res.ended) {
      nodeRes.writeHead(204)
      nodeRes.end()
    }
  } catch (error) {
    if (isBodyTooLargeError(error)) {
      nodeRes.writeHead(413, {
        'Content-Type': 'application/json; charset=utf-8',
      })
      nodeRes.end(JSON.stringify({ error: 'Payload too large' }))
      return
    }

    nodeRes.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    nodeRes.end(JSON.stringify({ error: 'Internal server error' }))
  }
}

loadDotEnvFile(path.join(process.cwd(), '.env'))
loadDotEnvFile(path.join(process.cwd(), '.env.local'))

const server = http.createServer((req, res) => {
  void dispatchHandler(req, res)
})

server.listen(API_PORT, () => {
  console.log(`[local-api] listening on http://localhost:${API_PORT}`)
})
