import nodemailer from 'nodemailer'

const GENERIC_CONTACT_ERROR =
  'The contact service is temporarily unavailable. Please try again shortly.'

const MAX_EMAIL_LENGTH = 254
const MAX_MESSAGE_LENGTH = 2000

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 6

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const rateLimitStore = new Map()
let smtpTransporter
let smtpTransporterAuthKey = ''

function safeLog(event, metadata = {}) {
  console.error(`[contact-api] ${event}`, metadata)
}

function sanitizeText(input, maxLength) {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/[\p{Cc}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

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
  if (rateLimitStore.size < 500) {
    return
  }

  for (const [clientId, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(clientId)
    }
  }
}

function consumeRateLimit(clientId) {
  const now = Date.now()
  cleanupRateLimitStore(now)

  const currentEntry = rateLimitStore.get(clientId)

  if (!currentEntry || currentEntry.resetAt <= now) {
    rateLimitStore.set(clientId, {
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

function isOriginAllowed(req) {
  const configuredOrigins = process.env.ALLOWED_ORIGIN
  const requestOrigin = normalizeOrigin(req.headers.origin)

  if (!requestOrigin) {
    return true
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(requestOrigin)
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

function parseJsonBody(req) {
  let body = req.body

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return { error: 'Invalid JSON payload' }
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' }
  }

  return { body }
}

function getSmtpCredentials() {
  const user =
    typeof process.env.GMAIL_SMTP_USER === 'string'
      ? process.env.GMAIL_SMTP_USER.trim()
      : ''
  const pass =
    typeof process.env.GMAIL_SMTP_APP_PASSWORD === 'string'
      ? process.env.GMAIL_SMTP_APP_PASSWORD.replace(/\s+/g, '').trim()
      : ''

  return { user, pass }
}

function getTransporter(user, pass) {
  const authKey = `${user}:${pass}`

  if (smtpTransporter && smtpTransporterAuthKey === authKey) {
    return smtpTransporter
  }

  smtpTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  })
  smtpTransporterAuthKey = authKey

  return smtpTransporter
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
  res.setHeader(
    'X-RateLimit-Reset',
    String(Math.floor(rateLimitState.resetAt / 1000)),
  )

  if (rateLimitState.limited) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((rateLimitState.resetAt - Date.now()) / 1000),
    )

    res.setHeader('Retry-After', String(retryAfterSeconds))
    return res.status(429).json({ error: 'Too many requests. Please slow down.' })
  }

  const smtpCredentials = getSmtpCredentials()

  if (
    !smtpCredentials.user ||
    !smtpCredentials.pass ||
    !process.env.CONTACT_TO_EMAIL
  ) {
    safeLog('Missing required contact environment variables')
    return res.status(500).json({ error: GENERIC_CONTACT_ERROR })
  }

  const parsedBody = parseJsonBody(req)

  if (parsedBody.error) {
    return res.status(400).json({ error: parsedBody.error })
  }

  const email = sanitizeText(parsedBody.body?.email, MAX_EMAIL_LENGTH)
  const message = sanitizeText(parsedBody.body?.message, MAX_MESSAGE_LENGTH)

  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required.' })
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' })
  }

  const subject = `Portfolio message from ${email}`
  const text = [
    'New contact form message from your portfolio website.',
    '',
    `Email: ${email}`,
    '',
    'Message:',
    message,
  ].join('\n')

  try {
    const transporter = getTransporter(smtpCredentials.user, smtpCredentials.pass)

    await transporter.sendMail({
      from: `Portfolio Contact <${smtpCredentials.user}>`,
      to: process.env.CONTACT_TO_EMAIL,
      subject,
      replyTo: email,
      text,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    safeLog('SMTP provider request failed', {
      message:
        error instanceof Error && error.message ? error.message : 'Unknown error',
    })
    return res.status(500).json({ error: GENERIC_CONTACT_ERROR })
  }
}