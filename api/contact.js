import nodemailer from 'nodemailer'
import { resolveMx } from 'node:dns/promises'

const GEMINI_MODEL = 'gemini-2.5-flash'
const GENERIC_CONTACT_ERROR =
  'The contact service is temporarily unavailable. Please try again shortly.'

const MAX_EMAIL_LENGTH = 254
const MAX_MESSAGE_LENGTH = 2000

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 6

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'dispostable.com', 'mailnesia.com', 'maildrop.cc', 'trashmail.com',
  'tempail.com', 'fakeinbox.com', 'getnada.com', 'temp-mail.org',
  'mohmal.com', 'burnermail.io', 'minutemail.com',
])

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
    return process.env.NODE_ENV !== 'production'
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

async function verifyEmailDomain(email) {
  const domain = email.split('@')[1]?.toLowerCase()

  if (!domain) {
    return { valid: false, reason: 'Invalid email format.' }
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Please use a permanent email address, not a disposable one.' }
  }

  try {
    const records = await resolveMx(domain)
    if (!records || records.length === 0) {
      return { valid: false, reason: 'This email domain does not appear to accept mail. Please check your email address.' }
    }
    return { valid: true }
  } catch {
    return { valid: false, reason: 'This email domain could not be verified. Please check your email address.' }
  }
}

async function moderateMessage(message) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return { safe: true }
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

  const payload = {
    system_instruction: {
      parts: [{
        text: `You are a content moderation system for a professional portfolio contact form. Evaluate the message and respond with ONLY a JSON object, nothing else.

Rules:
- Flag messages that are clearly toxic, hateful, threatening, sexually explicit, or harassing.
- Flag messages that are obvious spam (ads, phishing, scam links, gibberish).
- Do NOT flag messages that are simply short, casual, or informal. People can say "hi", ask simple questions, or be brief.
- Do NOT flag constructive criticism, negative feedback about work, or blunt but non-abusive language.
- Be lenient. Only flag genuinely harmful or spam content.

Respond with exactly this JSON format:
{"safe": true} or {"safe": false, "reason": "brief explanation"}`
      }]
    },
    contents: [{
      role: 'user',
      parts: [{ text: message }]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 100,
    },
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return { safe: true }
    }

    const data = await response.json().catch(() => null)
    const rawText = data?.candidates?.[0]?.content?.parts
      ?.map((p) => (typeof p?.text === 'string' ? p.text : ''))
      .join('')
      .trim()

    if (!rawText) {
      return { safe: true }
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { safe: true }
    }

    const result = JSON.parse(jsonMatch[0])

    if (typeof result.safe === 'boolean') {
      return result
    }

    return { safe: true }
  } catch {
    return { safe: true }
  }
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

function getAllowedOrigin(req) {
  const requestOrigin = normalizeOrigin(req.headers.origin)
  if (!requestOrigin) return null

  const configuredOrigins = process.env.ALLOWED_ORIGIN

  if (process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(requestOrigin)) {
    return requestOrigin
  }

  if (configuredOrigins) {
    const allowList = configuredOrigins.split(',').map(normalizeOrigin).filter(Boolean)
    if (allowList.includes(requestOrigin)) return requestOrigin
  }

  return null
}

function setCorsHeaders(req, res) {
  const origin = getAllowedOrigin(req)
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
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

  if (/[\r\n]/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' })
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' })
  }

  const emailVerification = await verifyEmailDomain(email)

  if (!emailVerification.valid) {
    return res.status(400).json({ error: emailVerification.reason })
  }

  const moderation = await moderateMessage(message)

  if (!moderation.safe) {
    return res.status(400).json({
      error: 'Your message was flagged as inappropriate. Please revise and try again.',
    })
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