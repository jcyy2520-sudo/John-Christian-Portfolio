import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chatHandler from '../api/chat.js'

const GENERIC_CHAT_ERROR =
  'The chat service is temporarily unavailable. Please try again shortly.'
const OUT_OF_SCOPE_FALLBACK =
  'I can only answer questions related to my portfolio.'
const TAGALOG_MARKERS = [
  'ang',
  'yung',
  'ito',
  'kasi',
  'ako',
  'ko',
  'mga',
  'nalilito',
  'badtrip',
  'paano',
]
const ENGLISH_MARKERS = [
  'experience',
  'technologies',
  'project',
  'role',
  'framework',
  'developer',
  'capability',
  'trade-offs',
]
const KNOWN_PROJECT_NAMES = [
  'Student Information Management System',
  'Barangay Request Tracker',
  'Mindoro Campus Events Hub',
  'Inventory and Asset Monitoring Tool',
  'Portfolio and Certificate Archive',
]

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

function createMockRequest(body) {
  return {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body,
    socket: {
      remoteAddress: '127.0.0.1',
    },
  }
}

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: null,
    setHeader(name, value) {
      this.headers[name] = value
      return this
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
    end() {
      return this
    },
  }
}

function countMarkers(text, markers) {
  const normalizedText = text.toLowerCase()

  return markers.reduce((count, marker) => {
    return normalizedText.includes(marker) ? count + 1 : count
  }, 0)
}

function countProjectMentions(text) {
  const normalizedText = text.toLowerCase()

  return KNOWN_PROJECT_NAMES.reduce((count, projectName) => {
    return normalizedText.includes(projectName.toLowerCase())
      ? count + 1
      : count
  }, 0)
}

async function executeCase(testCase) {
  const req = createMockRequest({
    message: testCase.message,
    history: testCase.history || [],
  })
  const res = createMockResponse()

  await chatHandler(req, res)

  const reply = typeof res.payload?.reply === 'string'
    ? res.payload.reply.trim()
    : ''

  if (res.statusCode !== 200) {
    throw new Error(`${testCase.name}: expected status 200, received ${res.statusCode}`)
  }

  if (!reply) {
    throw new Error(`${testCase.name}: reply was empty`)
  }

  if (reply === GENERIC_CHAT_ERROR) {
    throw new Error(`${testCase.name}: provider returned generic failure`)
  }

  if (/groq|gemini|system prompt|developer message/i.test(reply)) {
    throw new Error(`${testCase.name}: reply leaked provider or hidden-instruction language`)
  }

  if (typeof testCase.expectExact === 'string' && reply !== testCase.expectExact) {
    throw new Error(`${testCase.name}: expected exact reply \"${testCase.expectExact}\" but received \"${reply}\"`)
  }

  if (Array.isArray(testCase.expectIncludes)) {
    for (const phrase of testCase.expectIncludes) {
      if (!reply.toLowerCase().includes(phrase.toLowerCase())) {
        throw new Error(`${testCase.name}: reply did not include expected phrase \"${phrase}\". Received: \"${reply}\"`)
      }
    }
  }

  if (Array.isArray(testCase.expectAnyIncludes)) {
    const hasExpectedPhrase = testCase.expectAnyIncludes.some((phrase) => {
      return reply.toLowerCase().includes(phrase.toLowerCase())
    })

    if (!hasExpectedPhrase) {
      throw new Error(`${testCase.name}: reply did not include any expected phrases. Received: \"${reply}\"`)
    }
  }

  if (Array.isArray(testCase.forbidIncludes)) {
    for (const phrase of testCase.forbidIncludes) {
      if (reply.toLowerCase().includes(phrase.toLowerCase())) {
        throw new Error(`${testCase.name}: reply included forbidden phrase \"${phrase}\"`)
      }
    }
  }

  if (typeof testCase.maxLength === 'number' && reply.length > testCase.maxLength) {
    throw new Error(`${testCase.name}: reply length ${reply.length} exceeded max ${testCase.maxLength}`)
  }

  if (typeof testCase.expectProjectMentionsAtLeast === 'number') {
    const projectMentions = countProjectMentions(reply)

    if (projectMentions < testCase.expectProjectMentionsAtLeast) {
      throw new Error(`${testCase.name}: expected at least ${testCase.expectProjectMentionsAtLeast} project mentions but received ${projectMentions}. Reply: "${reply}"`)
    }
  }

  if (testCase.expectLanguage === 'tagalog-like') {
    const tagalogScore = countMarkers(reply, TAGALOG_MARKERS)
    if (tagalogScore < 2) {
      throw new Error(`${testCase.name}: reply did not look Tagalog-like enough`)
    }
  }

  if (testCase.expectLanguage === 'english-like') {
    const englishScore = countMarkers(reply, ENGLISH_MARKERS)
    if (englishScore < 2) {
      throw new Error(`${testCase.name}: reply did not look English-like enough`)
    }
  }

  console.log(`[pass] ${testCase.name}`)
  console.log(reply)
  console.log('')
}

async function main() {
  loadDotEnvFile(path.join(process.cwd(), '.env'))
  loadDotEnvFile(path.join(process.cwd(), '.env.local'))

  const testCases = [
    {
      name: 'Broad projects overview prompt',
      message: 'Tell me about the projects',
      expectIncludes: [
        'Student Information Management System',
      ],
      expectAnyIncludes: [
        'Barangay Request Tracker',
        'Mindoro Campus Events Hub',
        'Inventory and Asset Monitoring Tool',
      ],
      expectProjectMentionsAtLeast: 3,
    },
    {
      name: 'Bundled contact prompt',
      message: 'Where and how do I message you?',
      expectIncludes: [
        'christiannjc25@gmail.com',
        '+63 966 9036 917',
        'github.com/jcyy2520-sudo',
        'Poblacion, Bansud, Oriental Mindoro, Philippines',
      ],
    },
    {
      name: 'Casual Taglish portfolio question',
      message: 'uy bro ano pinaka solid mong project and bakit?',
      expectAnyIncludes: [
        'Student Information Management System',
        'student portal',
      ],
      forbidIncludes: ['developer message', 'system prompt'],
      expectLanguage: 'tagalog-like',
    },
    {
      name: 'Reasoning-heavy portfolio question',
      message: 'Can you analyze which of your projects best demonstrates full-stack capability and explain the technical trade-offs in your stack choices?',
      expectIncludes: [
        'Student Information Management System',
      ],
      expectAnyIncludes: [
        'Laravel',
        'Blade',
        'MySQL',
      ],
      forbidIncludes: [
        'after reviewing my projects',
        'overall,',
      ],
      expectLanguage: 'english-like',
    },
    {
      name: 'Confused user prompt',
      message: 'Nalilito ako, ano ba talaga strongest skill mo at anong project best proof nun?',
      expectAnyIncludes: [
        'Laravel',
        'React',
        'Python',
        'strongest skill',
        'framework',
        'Student Information Management System',
      ],
      expectLanguage: 'tagalog-like',
    },
    {
      name: 'Frustrated user prompt',
      message: 'Badtrip ako, ang gulo ng portfolio mo. Sabihin mo nga diretso kung anong project pinaka importante at bakit.',
      expectAnyIncludes: [
        'Student Information Management System',
        'project',
      ],
      forbidIncludes: [
        'calm down',
        'relax',
      ],
      expectLanguage: 'tagalog-like',
    },
    {
      name: 'Formal user prompt',
      message: 'Good day. Kindly summarize your relevant experience and core technologies for a junior full-stack developer role.',
      expectAnyIncludes: [
        'Freelance Full Stack Developer',
        'Laravel',
        'React',
      ],
      expectLanguage: 'english-like',
    },
    {
      name: 'Out-of-scope prompt',
      message: 'Explain quantum physics in simple terms.',
      expectExact: OUT_OF_SCOPE_FALLBACK,
      maxLength: OUT_OF_SCOPE_FALLBACK.length,
    },
    {
      name: 'Vague follow-up with history',
      message: 'Paano naman yung isa pa?',
      history: [
        {
          sender: 'user',
          text: 'Ano pinaka solid mong project?',
        },
        {
          sender: 'bot',
          text: 'Ang pinaka solid kong project ay ang Student Information Management System dahil full-stack ito at may enrollment, grading, dashboard analytics, at secure authentication.',
        },
      ],
      expectAnyIncludes: [
        'Barangay Request Tracker',
        'Mindoro Campus Events Hub',
        'Inventory and Asset Monitoring Tool',
        'Portfolio and Certificate Archive',
      ],
      expectLanguage: 'tagalog-like',
    },
    {
      name: 'Terse detail follow-up',
      message: 'Detailed',
      history: [
        {
          sender: 'user',
          text: 'Hello hehe can you tell me about the projects and yung detailed sana',
        },
        {
          sender: 'bot',
          text: 'I\'d be happy to walk you through my projects. I\'ve worked on a variety of applications, including a Student Information Management System, which is a full-stack student portal built with Laravel, Blade, and MySQL.',
        },
      ],
      expectAnyIncludes: [
        'Student Information Management System',
        'Laravel',
        'MySQL',
        'dashboard analytics',
        'secure authentication',
      ],
      forbidIncludes: [
        'Let me give you a more detailed overview of my projects. 1.',
      ],
      expectLanguage: 'tagalog-like',
    },
    {
      name: 'Dissatisfied follow-up repair',
      message: 'Bruh',
      history: [
        {
          sender: 'user',
          text: 'Hello hehe can you tell me about the projects and yung detailed sana',
        },
        {
          sender: 'bot',
          text: 'Let me give you a more detailed overview of my projects. 1.',
        },
      ],
      expectAnyIncludes: [
        'Student Information Management System',
        'Laravel',
        'MySQL',
        'dashboard analytics',
      ],
      forbidIncludes: [
        'calm down',
        'relax',
        'Let me break it down for you.',
      ],
      expectLanguage: 'tagalog-like',
    },
    {
      name: 'Mixed-language messy skill prompt',
      message: 'if i hire u ano pinaka gamit mong tech stack tsaka saan mo siya nagamit exactly?',
      expectAnyIncludes: [
        'Laravel',
        'React',
        'MySQL',
        'Student Information Management System',
        'Mindoro Campus Events Hub',
      ],
      expectLanguage: 'tagalog-like',
    },
  ]

  for (const testCase of testCases) {
    await executeCase(testCase)
  }
}

main().catch((error) => {
  console.error('[chat-smoke-test] failed')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})