import fs from 'node:fs/promises'
import path from 'node:path'
import {
  getSecureAssetAbsolutePath,
  getSecureAssetConfig,
  isOriginAllowed,
  isValidSignedAssetRequest,
} from '../lib/secureAssets.js'

const GENERIC_ERROR = 'Unable to retrieve asset.'

function firstQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return typeof value === 'string' ? value : ''
}

function isRequestContextAllowed(req) {
  const fetchSite = req.headers['sec-fetch-site']

  if (!fetchSite || typeof fetchSite !== 'string') {
    return true
  }

  return (
    fetchSite === 'same-origin' ||
    fetchSite === 'same-site' ||
    fetchSite === 'none'
  )
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isOriginAllowed(req) || !isRequestContextAllowed(req)) {
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
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${path.basename(assetConfig.relativePath)}"`,
    )
    res.setHeader('Cache-Control', 'private, max-age=300, must-revalidate')

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
