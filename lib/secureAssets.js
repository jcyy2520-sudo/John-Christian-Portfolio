import crypto from 'node:crypto'
import path from 'node:path'

export const ASSET_URL_TTL_MS = 15 * 60 * 1000

const MAX_TOKEN_FUTURE_WINDOW_MS = 60 * 60 * 1000

const SECURE_ASSET_MAP = Object.freeze({
  'profile-photo': {
    relativePath: 'private-assets/profile/profile-photo.png',
    contentType: 'image/png',
  },
  'certificate-1': {
    relativePath: 'private-assets/certificates/certificate-1.svg',
    contentType: 'image/svg+xml',
  },
  'certificate-2': {
    relativePath: 'private-assets/certificates/certificate-2.svg',
    contentType: 'image/svg+xml',
  },
  'certificate-3': {
    relativePath: 'private-assets/certificates/certificate-3.svg',
    contentType: 'image/svg+xml',
  },
  'project-1': {
    relativePath: 'private-assets/projects/project-1.png',
    contentType: 'image/png',
  },
  'project-2': {
    relativePath: 'private-assets/projects/project-2.svg',
    contentType: 'image/svg+xml',
  },
  'project-3': {
    relativePath: 'private-assets/projects/project-3.svg',
    contentType: 'image/svg+xml',
  },
  'project-4': {
    relativePath: 'private-assets/projects/project-4.svg',
    contentType: 'image/svg+xml',
  },
  'project-5': {
    relativePath: 'private-assets/projects/project-5.svg',
    contentType: 'image/svg+xml',
  },
})

function getNormalizedSecret(secret) {
  if (typeof secret !== 'string') {
    return ''
  }

  return secret.trim()
}

function createSignature(assetId, expiresAt, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${assetId}:${expiresAt}`)
    .digest('hex')
}

function isSafeHex(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value)
}

function timingSafeHexEqual(left, right) {
  if (!isSafeHex(left) || !isSafeHex(right)) {
    return false
  }

  const leftBuffer = Buffer.from(left, 'hex')
  const rightBuffer = Buffer.from(right, 'hex')

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

export function getSecureAssetConfig(assetId) {
  if (typeof assetId !== 'string') {
    return null
  }

  return SECURE_ASSET_MAP[assetId] || null
}

export function getSecureAssetAbsolutePath(assetId) {
  const config = getSecureAssetConfig(assetId)

  if (!config) {
    return null
  }

  return path.join(process.cwd(), config.relativePath)
}

export function buildSignedAssetUrl(assetId, secret, ttlMs = ASSET_URL_TTL_MS) {
  const normalizedSecret = getNormalizedSecret(secret)

  if (normalizedSecret.length < 16) {
    return null
  }

  if (!getSecureAssetConfig(assetId)) {
    return null
  }

  const expiresAt = Date.now() + Math.max(30 * 1000, ttlMs)
  const token = createSignature(assetId, expiresAt, normalizedSecret)

  const searchParams = new URLSearchParams({
    assetId,
    expires: String(expiresAt),
    token,
  })

  return {
    url: `/_internal/asset-proxy?${searchParams.toString()}`,
    expiresAt,
  }
}

export function isValidSignedAssetRequest({ assetId, token, expires, secret }) {
  const normalizedSecret = getNormalizedSecret(secret)

  if (normalizedSecret.length < 16) {
    return false
  }

  if (!getSecureAssetConfig(assetId)) {
    return false
  }

  if (typeof token !== 'string' || token.length > 128) {
    return false
  }

  if (typeof expires !== 'string' && typeof expires !== 'number') {
    return false
  }

  const expiresAt = Number(expires)

  if (!Number.isFinite(expiresAt)) {
    return false
  }

  const now = Date.now()

  if (expiresAt <= now || expiresAt > now + MAX_TOKEN_FUTURE_WINDOW_MS) {
    return false
  }

  const expectedToken = createSignature(assetId, expiresAt, normalizedSecret)

  return timingSafeHexEqual(token, expectedToken)
}

function normalizeOrigin(origin) {
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

export function isOriginAllowed(req) {
  const configuredOrigins = process.env.ALLOWED_ORIGIN
  const requestOrigin = normalizeOrigin(req.headers.origin)

  if (!requestOrigin) {
    return true
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/i.test(requestOrigin)
  ) {
    return true
  }

  if (!configuredOrigins) {
    return true
  }

  const allowList = configuredOrigins
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean)

  return allowList.includes(requestOrigin)
}
