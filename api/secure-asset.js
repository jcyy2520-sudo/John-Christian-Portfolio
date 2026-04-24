import fs from 'node:fs/promises'
import {
  getSecureAssetAbsolutePath,
  getSecureAssetConfig,
  getSecureAssetRequestBinding,
  isValidSignedAssetRequest,
} from '../lib/secureAssets.js'
import {
  isOriginAllowed,
  isTrustedFetchSite,
  setCorsHeaders,
  setDefaultApiHeaders,
} from '../lib/requestSecurity.js'

const GENERIC_ERROR = 'Unable to retrieve asset.'

function firstQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return typeof value === 'string' ? value : ''
}

export default async function handler(req, res) {
  setDefaultApiHeaders(res, { cacheControl: 'private, max-age=60, must-revalidate' })
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  setCorsHeaders(req, res, { methods: 'GET, HEAD, OPTIONS', allowPrivateNetworkInDev: true })

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (
    !isOriginAllowed(req, { allowPrivateNetworkInDev: true }) ||
    !isTrustedFetchSite(req)
  ) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const assetId = firstQueryValue(req.query?.assetId)
  const expires = firstQueryValue(req.query?.expires)
  const token = firstQueryValue(req.query?.token)

  if (!assetId || !expires || !token) {
    return res.status(400).json({ error: 'Missing required query parameters.' })
  }

  if (!process.env.ASSET_SIGNING_SECRET) {
    return res.status(500).json({ error: GENERIC_ERROR })
  }

  if (
    !isValidSignedAssetRequest({
      assetId,
      expires,
      token,
      secret: process.env.ASSET_SIGNING_SECRET,
      requestBinding: getSecureAssetRequestBinding(req),
    })
  ) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const assetConfig = getSecureAssetConfig(assetId)
  const absolutePath = getSecureAssetAbsolutePath(assetId)

  if (!assetConfig || !absolutePath) {
    return res.status(404).json({ error: 'Asset not found.' })
  }

  try {
    const fileBuffer = await fs.readFile(absolutePath)

    res.setHeader('Content-Type', assetConfig.contentType)
    res.setHeader('Content-Disposition', 'inline')

    if (req.method === 'HEAD') {
      return res.status(200).end()
    }

    res.status(200)
    return res.end(fileBuffer)
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Asset not found.' })
    }

    return res.status(500).json({ error: GENERIC_ERROR })
  }
}
