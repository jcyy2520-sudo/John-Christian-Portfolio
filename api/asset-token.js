import {
  ASSET_URL_TTL_MS,
  buildSignedAssetUrl,
  getSecureAssetConfig,
  isOriginAllowed,
} from '../lib/secureAssets.js'

const GENERIC_ERROR = 'Unable to prepare secure asset access.'
const MAX_ASSET_IDS_PER_REQUEST = 12
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 40

const tokenRateLimitStore = new Map()

function getClientIdentifier(req) {
  const forwardedFor = req.headers['x-forwarded-for']

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim()
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length) {
    return String(forwardedFor[0]).split(',')[0].trim()
  }

  return req.socket?.remoteAddress || 'unknown-client'
}

function cleanupRateLimitStore(now) {
  if (tokenRateLimitStore.size < 500) {
    return
  }

  for (const [clientId, entry] of tokenRateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      tokenRateLimitStore.delete(clientId)
    }
  }
}

function consumeRateLimit(clientId) {
  const now = Date.now()
  cleanupRateLimitStore(now)

  const currentEntry = tokenRateLimitStore.get(clientId)

  if (!currentEntry || currentEntry.resetAt <= now) {
    tokenRateLimitStore.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })

    return {
      limited: false,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    }
  }

  currentEntry.count += 1

  return {
    limited: currentEntry.count > RATE_LIMIT_MAX_REQUESTS,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - currentEntry.count),
    resetAt: currentEntry.resetAt,
  }
}

function toArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isOriginAllowed(req)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const contentType = req.headers['content-type']

  if (typeof contentType === 'string' && !contentType.includes('application/json')) {
    return res.status(415).json({ error: 'Unsupported media type' })
  }

  const clientId = getClientIdentifier(req)
  const rateLimitState = consumeRateLimit(clientId)

  res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS))
  res.setHeader('X-RateLimit-Remaining', String(rateLimitState.remaining))
  res.setHeader('X-RateLimit-Reset', String(Math.floor(rateLimitState.resetAt / 1000)))

  if (rateLimitState.limited) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((rateLimitState.resetAt - Date.now()) / 1000),
    )

    res.setHeader('Retry-After', String(retryAfterSeconds))
    return res.status(429).json({ error: 'Too many requests. Please slow down.' })
  }

  if (!process.env.ASSET_SIGNING_SECRET) {
    return res.status(500).json({ error: GENERIC_ERROR })
  }

  let body = req.body

  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body)
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload' })
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' })
  }

  const requestedAssetIds = toArray(body.assetIds)
    .slice(0, MAX_ASSET_IDS_PER_REQUEST)
    .flatMap((item) => {
      if (typeof item !== 'string') {
        return []
      }

      const assetId = item.trim()

      if (!assetId || !getSecureAssetConfig(assetId)) {
        return []
      }

      return [assetId]
    })

  const uniqueAssetIds = [...new Set(requestedAssetIds)]

  if (!uniqueAssetIds.length) {
    return res.status(400).json({ error: 'No valid asset ids were provided.' })
  }

  const assets = {}

  for (const assetId of uniqueAssetIds) {
    const signed = buildSignedAssetUrl(
      assetId,
      process.env.ASSET_SIGNING_SECRET,
      ASSET_URL_TTL_MS,
    )

    if (signed) {
      assets[assetId] = signed.url
    }
  }

  if (!Object.keys(assets).length) {
    return res.status(500).json({ error: GENERIC_ERROR })
  }

  return res.status(200).json({ assets })
}
