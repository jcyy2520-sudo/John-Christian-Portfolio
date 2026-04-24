const DEV_LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i
const DEV_PRIVATE_NETWORK_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/i

export function getFirstHeaderValue(value) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

export function normalizeOrigin(origin) {
  if (typeof origin !== 'string') {
    return ''
  }

  const trimmedOrigin = origin.trim()

  if (!trimmedOrigin) {
    return ''
  }

  try {
    const parsedUrl = new URL(trimmedOrigin)
    return `${parsedUrl.protocol}//${parsedUrl.host}`.toLowerCase()
  } catch {
    return trimmedOrigin.replace(/\/+$/, '').toLowerCase()
  }
}

function matchesDevelopmentOrigin(origin, allowPrivateNetworkInDev) {
  const pattern = allowPrivateNetworkInDev
    ? DEV_PRIVATE_NETWORK_PATTERN
    : DEV_LOCALHOST_PATTERN

  return pattern.test(origin)
}

export function getAllowedOrigin(req, options = {}) {
  const { allowPrivateNetworkInDev = false } = options
  const requestOrigin = normalizeOrigin(req?.headers?.origin)

  if (!requestOrigin) {
    return null
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    matchesDevelopmentOrigin(requestOrigin, allowPrivateNetworkInDev)
  ) {
    return requestOrigin
  }

  const configuredOrigins = process.env.ALLOWED_ORIGIN

  if (!configuredOrigins) {
    return null
  }

  const allowList = configuredOrigins
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean)

  return allowList.includes(requestOrigin) ? requestOrigin : null
}

export function isOriginAllowed(req, options = {}) {
  const requestOrigin = normalizeOrigin(req?.headers?.origin)

  if (!requestOrigin) {
    return true
  }

  if (getAllowedOrigin(req, options)) {
    return true
  }

  return process.env.NODE_ENV !== 'production'
}

export function isTrustedFetchSite(req) {
  const fetchSite = getFirstHeaderValue(req?.headers?.['sec-fetch-site'])

  if (!fetchSite) {
    return true
  }

  return (
    fetchSite === 'same-origin' ||
    fetchSite === 'same-site' ||
    fetchSite === 'none'
  )
}

export function setCorsHeaders(req, res, options = {}) {
  const {
    methods = 'POST, OPTIONS',
    headers = 'Content-Type',
    maxAge = '86400',
    allowPrivateNetworkInDev = false,
  } = options

  const origin = getAllowedOrigin(req, { allowPrivateNetworkInDev })

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', methods)
  res.setHeader('Access-Control-Allow-Headers', headers)
  res.setHeader('Access-Control-Max-Age', maxAge)
}

export function setDefaultApiHeaders(res, options = {}) {
  const { cacheControl = 'no-store, max-age=0' } = options

  res.setHeader('Cache-Control', cacheControl)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
}

export function getClientIdentifier(req) {
  const forwardedFor = req?.headers?.['x-forwarded-for']

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim()
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length) {
    return String(forwardedFor[0]).split(',')[0].trim()
  }

  return req?.socket?.remoteAddress || 'unknown-client'
}

function getContentLength(req) {
  const rawContentLength = getFirstHeaderValue(req?.headers?.['content-length'])

  if (!rawContentLength) {
    return null
  }

  const parsedLength = Number.parseInt(rawContentLength, 10)

  return Number.isFinite(parsedLength) && parsedLength >= 0
    ? parsedLength
    : null
}

function getBodyByteLength(body) {
  if (typeof body === 'string') {
    return Buffer.byteLength(body, 'utf8')
  }

  if (!body || typeof body !== 'object') {
    return 0
  }

  try {
    return Buffer.byteLength(JSON.stringify(body), 'utf8')
  } catch {
    return Number.POSITIVE_INFINITY
  }
}

export function isBodyWithinLimit(req, maxBytes) {
  if (!Number.isFinite(maxBytes) || maxBytes < 1) {
    return false
  }

  const contentLength = getContentLength(req)

  if (contentLength !== null && contentLength > maxBytes) {
    return false
  }

  return getBodyByteLength(req?.body) <= maxBytes
}