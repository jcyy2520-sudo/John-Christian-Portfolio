import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiCheckCircle,
  FiMessageCircle,
  FiMoon,
  FiSend,
  FiSun,
  FiX,
} from 'react-icons/fi'
import { MdCall, MdLocationOn } from 'react-icons/md'
import {
  SiCss,
  SiGmail,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiLaravel,
  SiMysql,
  SiPhp,
  SiPython,
  SiReact,
} from 'react-icons/si'
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import './App.css'

function useFadeIn() {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('fade-in-visible')
          observer.unobserve(element)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return ref
}

const CHAT_ERROR_MESSAGE =
  'I cannot respond right now. Please try again in a moment.'
const IMAGE_FALLBACK_SRC = '/favicon.svg'
const PROFILE_ASSET_ID = 'profile-photo'
const MAX_CONTACT_EMAIL_LENGTH = 254
const MAX_CONTACT_MESSAGE_LENGTH = 2000
const MAX_CHAT_MESSAGE_LENGTH = 1000

const techStack = [
  { name: 'Laravel', icon: SiLaravel, color: '#ff2d20' },
  { name: 'React', icon: SiReact, color: '#61dafb' },
  { name: 'Python', icon: SiPython, color: '#3776ab' },
  { name: 'MySQL', icon: SiMysql, color: '#00758f' },
  { name: 'HTML', icon: SiHtml5, color: '#e34f26' },
  { name: 'CSS', icon: SiCss, color: '#1572b6' },
  { name: 'JavaScript', icon: SiJavascript, color: '#f7df1e' },
  { name: 'Blade', image: '/stack/blade.svg' },
  { name: 'PHP', icon: SiPhp, color: '#777bb4' },
]

const projects = [
  {
    title: 'Student Information Management System',
    year: '2025',
    assetId: 'project-1',
    summary:
      'Built a full-stack student portal for enrollment, grading, and dashboard analytics with secure authentication.',
    stack: ['Laravel', 'Blade', 'MySQL'],
  },
  {
    title: 'Barangay Request Tracker',
    year: '2025',
    assetId: 'project-2',
    summary:
      'Created a web app to manage clearance and request workflows with status updates and printable records.',
    stack: ['Laravel', 'PHP', 'MySQL'],
  },
  {
    title: 'Mindoro Campus Events Hub',
    year: '2024',
    assetId: 'project-3',
    summary:
      'Developed an events platform for announcements, registration, and attendance monitoring for campus activities.',
    stack: ['React', 'JavaScript', 'CSS'],
  },
  {
    title: 'Inventory and Asset Monitoring Tool',
    year: '2024',
    assetId: 'project-4',
    summary:
      'Designed an internal tool for equipment monitoring, stock movement, and report generation by department.',
    stack: ['Python', 'PHP', 'MySQL'],
  },
  {
    title: 'Portfolio and Certificate Archive',
    year: '2023',
    assetId: 'project-5',
    summary:
      'Implemented a personal website that showcases projects, certificates, and profile details with responsive design.',
    stack: ['React', 'HTML', 'CSS'],
  },
]

const experiences = [
  {
    role: 'Freelance Full Stack Developer',
    period: '2025 - Present',
    detail:
      'Building web systems with Laravel and React, with a focus on clean architecture and scalable database design.',
  },
  {
    role: 'Web Development Practicum',
    period: '2024 - 2025',
    detail:
      'Developed CRUD applications, authentication flows, and reusable UI components for class and internship requirements.',
  },
  {
    role: 'Campus Project Contributor',
    period: '2024',
    detail:
      'Collaborated on school projects by implementing backend APIs, integrating frontend pages, and testing user flows.',
  },
  {
    role: 'Self-Directed Full Stack Training',
    period: '2023 - 2024',
    detail:
      'Focused on Python, PHP, SQL, and modern JavaScript while building personal systems to practice real-world problem solving.',
  },
]

const certificates = [
  {
    title: 'Web Development Fundamentals',
    source: 'Course Certificate',
    assetId: 'certificate-1',
  },
  {
    title: 'Frontend Development Essentials',
    source: 'Training Certificate',
    assetId: 'certificate-2',
  },
  {
    title: 'Backend Development Workshop',
    source: 'Seminar Certificate',
    assetId: 'certificate-3',
  },
]

const contactItems = [
  {
    key: 'email',
    icon: SiGmail,
    value: 'christiannjc25@gmail.com',
    mobileValue: 'christiannjc25@gmail.com',
    color: '#d14836',
    darkColor: '#ef6a5a',
  },
  {
    key: 'phone',
    icon: MdCall,
    value: '+63 966 9036 917',
    mobileValue: '+63 966 9036 917',
    color: '#0f9d58',
    darkColor: '#2bc36b',
  },
  {
    key: 'github',
    icon: SiGithub,
    value: 'github.com/jcyy2520-sudo',
    mobileValue: 'github.com/jcyy2520-sudo',
    color: '#111827',
    darkColor: '#f3f4f6',
  },
  {
    key: 'location',
    icon: MdLocationOn,
    value: 'Poblacion, Bansud, Oriental Mindoro, Philippines',
    mobileValue: 'Bansud, Oriental Mindoro',
    color: '#2563eb',
    darkColor: '#64a2ff',
  },
]

function App() {
  const contactEmail = 'christiannjc25@gmail.com'
  const contactPhoneHref = 'tel:+639669036917'
  const mapsHref =
    'https://www.google.com/maps/search/?api=1&query=Poblacion%2C+Bansud%2C+Oriental+Mindoro%2C+Philippines'

  const contactRailItems = [
    {
      key: 'mail',
      title: 'MAIL US',
      lines: [contactEmail],
      href: `mailto:${contactEmail}`,
      icon: SiGmail,
      external: false,
    },
    {
      key: 'phone',
      title: 'CONTACT US',
      lines: ['+63 966 9036 917'],
      href: contactPhoneHref,
      icon: MdCall,
      external: false,
    },
    {
      key: 'location',
      title: 'LOCATION',
      lines: ['Poblacion, Bansud', 'Oriental Mindoro, Philippines'],
      href: mapsHref,
      icon: MdLocationOn,
      external: true,
    },
  ]

  const socialContactItems = [
    {
      key: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/',
      icon: FaLinkedinIn,
      external: true,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: FaInstagram,
      external: true,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      href: 'https://www.facebook.com/',
      icon: FaFacebookF,
      external: true,
    },
  ]

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const savedTheme = window.localStorage.getItem('theme')

    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  const [activeModal, setActiveModal] = useState(null)
  const [activeContact, setActiveContact] = useState('email')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [hasOpenedChat, setHasOpenedChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isChatSending, setIsChatSending] = useState(false)
  const [visitorMessage, setVisitorMessage] = useState({
    email: '',
    message: '',
  })
  const [visitorMessageError, setVisitorMessageError] = useState('')
  const [isVisitorMessageSending, setIsVisitorMessageSending] = useState(false)
  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello. I am your portfolio assistant. Ask me about projects, experience, education, certificates, or tech stack.',
    },
  ])
  const [secureAssetUrls, setSecureAssetUrls] = useState({})
  const chatMessagesEndRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setActiveModal(null)
        setIsThankYouModalOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)

    return () => {
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const secureAssetIds = useMemo(
    () => [
      PROFILE_ASSET_ID,
      ...certificates.map((certificate) => certificate.assetId),
      ...projects.map((project) => project.assetId),
    ],
    [],
  )

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchSecureAssetUrls = async () => {
      try {
        const response = await fetch('/api/asset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assetIds: secureAssetIds,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          return
        }

        const payload = await response.json().catch(() => null)

        if (
          !isMounted ||
          !payload ||
          typeof payload !== 'object' ||
          !payload.assets ||
          typeof payload.assets !== 'object'
        ) {
          return
        }

        setSecureAssetUrls(payload.assets)
      } catch {
        // Keep fallback asset if secure token retrieval fails.
      }
    }

    fetchSecureAssetUrls()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [secureAssetIds])

  const visibleExperience = useMemo(
    () => experiences.slice(0, Math.min(2, experiences.length)),
    [],
  )

  const visibleProjects = useMemo(
    () => projects.slice(0, Math.min(4, projects.length)),
    [],
  )

  const visibleCertificates = useMemo(
    () => certificates.slice(0, Math.min(2, certificates.length)),
    [],
  )

  const getSecureAssetUrl = (assetId) => {
    if (typeof assetId !== 'string') {
      return IMAGE_FALLBACK_SRC
    }

    return secureAssetUrls[assetId] || IMAGE_FALLBACK_SRC
  }

  const openProjectModal = (project) => {
    const image =
      typeof project.image === 'string' && project.image
        ? project.image
        : getSecureAssetUrl(project.assetId)

    setActiveModal({
      type: 'project-detail',
      title: project.title,
      subtitle: project.year,
      image,
      description: project.summary,
      tags: project.stack,
    })
  }

  const openCertificateModal = (certificate) => {
    setActiveModal({
      type: 'certificate-detail',
      title: certificate.title,
      subtitle: certificate.source,
      image: certificate.image,
    })
  }

  const openExperienceListModal = () => {
    setActiveModal({ type: 'experience-list', title: 'All Experience' })
  }

  const openProjectsListModal = () => {
    setActiveModal({ type: 'projects-list', title: 'All Projects' })
  }

  const openCertificatesListModal = () => {
    setActiveModal({ type: 'certificates-list', title: 'All Certificates' })
  }

  const updateVisitorMessageField = (field, value) => {
    const normalizedValue =
      field === 'email'
        ? value.slice(0, MAX_CONTACT_EMAIL_LENGTH)
        : value.slice(0, MAX_CONTACT_MESSAGE_LENGTH)

    setVisitorMessage((previous) => ({
      ...previous,
      [field]: normalizedValue,
    }))

    if (visitorMessageError) {
      setVisitorMessageError('')
    }
  }

  const submitVisitorMessage = async (event) => {
    event.preventDefault()

    if (isVisitorMessageSending) {
      return
    }

    const email = visitorMessage.email.trim()
    const message = visitorMessage.message.trim()

    if (!email || !message) {
      setVisitorMessageError('Please complete email and message.')
      return
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!isEmailValid) {
      setVisitorMessageError('Please enter a valid email address.')
      return
    }

    setVisitorMessageError('')
    setIsVisitorMessageSending(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          message,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === 'string' && payload.error.trim()
            ? payload.error
            : 'Unable to send your message right now. Please try again.',
        )
      }

      setVisitorMessage({
        email: '',
        message: '',
      })
      setIsThankYouModalOpen(true)
    } catch (error) {
      const nextError =
        error instanceof Error && error.message
          ? error.message
          : 'Unable to send your message right now. Please try again.'

      setVisitorMessageError(nextError)
    } finally {
      setIsVisitorMessageSending(false)
    }
  }

  const sendChatMessage = async () => {
    const trimmedMessage = chatInput.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH)

    if (!trimmedMessage || isChatSending) {
      return
    }

    const history = [...chatMessages]
    const userMessage = { sender: 'user', text: trimmedMessage }

    setChatMessages((previous) => [
      ...previous,
      userMessage,
    ])
    setChatInput('')
    setIsChatSending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          history,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to fetch chatbot reply')
      }

      const botReply =
        typeof payload?.reply === 'string' && payload.reply.trim()
          ? payload.reply.trim()
          : CHAT_ERROR_MESSAGE

      setChatMessages((previous) => [
        ...previous,
        { sender: 'bot', text: botReply },
      ])
    } catch {
      setChatMessages((previous) => [
        ...previous,
        { sender: 'bot', text: CHAT_ERROR_MESSAGE },
      ])
    } finally {
      setIsChatSending(false)
    }
  }

  useEffect(() => {
    if (!isChatOpen) {
      return
    }

    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isChatOpen])

  const isDarkMode = theme === 'dark'

  const fadeRefStack = useFadeIn()
  const fadeRefMain = useFadeIn()
  const fadeRefCerts = useFadeIn()
  const fadeRefMessage = useFadeIn()
  const fadeRefFooter = useFadeIn()

  return (
    <main className="portfolio-page">
      <header className="hero-card panel">
        <button
          type="button"
          className="theme-toggle hero-theme-toggle"
          aria-label={
            isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
          }
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
        >
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>
        <div className="hero-grid">
          <div className="profile-slot">
            <img src={getSecureAssetUrl(PROFILE_ASSET_ID)} alt="Profile" />
          </div>
          <div className="hero-copy">
            <h1>John Christian D. Fajutagana</h1>
            <p className="hero-role">Junior System Analyst</p>
            <p className="hero-intro">
              I build full-stack web applications using Laravel and React,
              focusing on clean architecture, reliable backend logic, and
              long-term maintainability. From database design and API
              development to responsive frontends and authentication flows, I
              handle every layer of the stack. My goal is to create practical
              digital solutions that perform well, scale with real user needs,
              and are built to last.
            </p>
            <div className="contact-strip" aria-label="Contact details">
              {contactItems.map((item) => {
                const Icon = item.icon
                const isActive = activeContact === item.key
                const mobileContactText =
                  typeof item.mobileValue === 'string' && item.mobileValue
                    ? item.mobileValue
                    : item.value

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`contact-chip ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveContact(item.key)}
                    aria-label={item.value}
                    style={{
                      '--contact-color': item.color,
                      '--contact-color-dark': item.darkColor,
                    }}
                  >
                    <span className="contact-icon-wrap">
                      <Icon />
                    </span>
                    <span className="contact-value">{item.value}</span>
                    <span className="contact-mobile-label">{mobileContactText}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <section className="panel fade-in" ref={fadeRefStack}>
        <div className="section-heading">
          <h2>Tech Stack</h2>
        </div>
        <div className="stack-grid">
          {techStack.map((item) => {
            const Icon = item.icon

            return (
              <div key={item.name} className="stack-logo">
                {Icon ? (
                  <Icon style={{ color: item.color }} aria-label={item.name} />
                ) : (
                  <img src={item.image} alt={item.name} />
                )}
                <span className="stack-tooltip">{item.name}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="main-content-grid fade-in" ref={fadeRefMain}>
        <div className="left-column">
          <section className="panel experience-panel">
            <div className="section-heading">
              <h2>Experience</h2>
              <button
                className="action-button section-view-button"
                type="button"
                onClick={openExperienceListModal}
              >
                View All
              </button>
            </div>
            <div className="experience-list">
              {visibleExperience.map((experience) => (
                <article key={experience.role} className="experience-card">
                  <div className="experience-head">
                    <h3>{experience.role}</h3>
                    <span className="section-year">{experience.period}</span>
                  </div>
                  <p>{experience.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel education-panel">
            <div className="education-head-row">
              <h2>Education</h2>
              <p className="education-year section-year">2023 - 2027</p>
            </div>
            <h3>Bachelor of Science in Information Technology</h3>
            <p>Mindoro State University - Bongabong Campus</p>
            <p>Labasan, Bongabong, Oriental Mindoro, Philippines</p>
          </section>
        </div>

        <section className="panel projects-panel">
          <div className="section-heading">
            <h2>Projects</h2>
            <button
              className="action-button section-view-button"
              type="button"
              onClick={openProjectsListModal}
            >
              View All
            </button>
          </div>
          <div className="project-list">
            {visibleProjects.map((project) => {
              const projectImage = getSecureAssetUrl(project.assetId)

              return (
                <article key={project.title} className="project-card">
                  <button
                    type="button"
                    className="project-toggle"
                    onClick={() =>
                      openProjectModal({
                        ...project,
                        image: projectImage,
                      })
                    }
                  >
                    <img src={projectImage} alt={project.title} />
                    <div className="project-title-row">
                      <h3>{project.title}</h3>
                      <span>View details</span>
                    </div>
                  </button>
                </article>
              )
            })}
          </div>
        </section>

      </section>

      <section className="panel fade-in" ref={fadeRefCerts}>
        <div className="section-heading">
          <h2>Certificates</h2>
          <button
            className="action-button section-view-button"
            type="button"
            onClick={openCertificatesListModal}
          >
            View All
          </button>
        </div>
        <div className="certificate-grid">
          {visibleCertificates.map((certificate) => {
            const certificateImage = getSecureAssetUrl(certificate.assetId)

            return (
              <article key={certificate.title} className="certificate-card">
                <img src={certificateImage} alt={certificate.title} />
                <div className="certificate-info">
                  <div>
                    <h3>{certificate.title}</h3>
                    <p>{certificate.source}</p>
                  </div>
                  <button
                    type="button"
                    className="view-link"
                    onClick={() =>
                      openCertificateModal({
                        ...certificate,
                        image: certificateImage,
                      })
                    }
                  >
                    View
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel visitor-message-panel fade-in" ref={fadeRefMessage}>
        <div className="section-heading">
          <h2>Contact</h2>
        </div>
        <div className="visitor-message-layout">
          <aside className="visitor-message-info">
            <h3 className="visitor-message-title">Get in touch</h3>
            <p className="visitor-message-intro">
              Have a project idea or collaboration opportunity? Reach me through
              any of these channels.
            </p>
            <div className="visitor-contact-rail" aria-label="Other contact options">
              {contactRailItems.map((item) => {
                const Icon = item.icon

                return (
                  <a
                    key={`message-rail-${item.key}`}
                    className="visitor-contact-row"
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                    aria-label={`Open ${item.title}`}
                  >
                    <span className="visitor-contact-row-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="visitor-contact-row-copy">
                      <span className="visitor-contact-row-label">{item.title}</span>
                      {item.lines.map((line, index) => (
                        <span
                          key={`${item.key}-line-${index}`}
                          className="visitor-contact-row-line"
                        >
                          {line}
                        </span>
                      ))}
                    </span>
                  </a>
                )
              })}
            </div>
            <div className="visitor-social-block">
              <p className="visitor-social-title">SOCIAL INFO</p>
              <div className="visitor-social-links">
                {socialContactItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <a
                      key={`social-${item.key}`}
                      className="visitor-social-link"
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noreferrer' : undefined}
                      aria-label={item.label}
                    >
                      <Icon />
                    </a>
                  )
                })}
              </div>
            </div>
          </aside>

          <form className="visitor-message-form" onSubmit={submitVisitorMessage}>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={visitorMessage.email}
                maxLength={MAX_CONTACT_EMAIL_LENGTH}
                onChange={(event) =>
                  updateVisitorMessageField('email', event.target.value)
                }
                placeholder="your@email.com"
                required
              />
            </label>

            <label className="visitor-message-textarea">
              Message
              <textarea
                name="message"
                value={visitorMessage.message}
                maxLength={MAX_CONTACT_MESSAGE_LENGTH}
                onChange={(event) =>
                  updateVisitorMessageField('message', event.target.value)
                }
                rows={5}
                placeholder="Tell me about your project, role, or collaboration idea..."
                required
              />
            </label>

            {visitorMessageError ? (
              <p className="visitor-message-error" role="alert">
                {visitorMessageError}
              </p>
            ) : null}

            <button
              type="submit"
              className="action-button visitor-message-submit"
              disabled={isVisitorMessageSending}
              aria-busy={isVisitorMessageSending}
            >
              <FiSend aria-hidden="true" />
              <span>{isVisitorMessageSending ? 'Sending...' : 'Send Message'}</span>
            </button>

            <p className="visitor-message-direct">
              Prefer direct email?{' '}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </p>
          </form>
        </div>
      </section>

      <footer className="site-footer fade-in" ref={fadeRefFooter}>
        <p>© 2026 John Christian D.. All Rights Reserved.</p>
        <p>Developed in Poblacion, Bansud, Oriental Mindoro, Philippines</p>
      </footer>

      {isThankYouModalOpen ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setIsThankYouModalOpen(false)}
        >
          <section
            className="modal-card thank-you-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="thanks-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close thank you modal"
              onClick={() => setIsThankYouModalOpen(false)}
            >
              <FiX />
            </button>
            <div className="modal-content">
              <div className="thank-you-badge" aria-hidden="true">
                <FiCheckCircle />
              </div>
              <p className="modal-type">Message Sent</p>
              <h3 id="thanks-title">Thank you for reaching out.</h3>
              <p>
                Your message has been delivered from this form. I will review it
                and get back to you as soon as possible.
              </p>
              <button
                type="button"
                className="action-button thank-you-close"
                onClick={() => setIsThankYouModalOpen(false)}
              >
                Done
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {activeModal ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setActiveModal(null)}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close modal"
              onClick={() => setActiveModal(null)}
            >
              <FiX />
            </button>
            {activeModal.type === 'project-detail' ||
            activeModal.type === 'certificate-detail' ? (
              <>
                <img src={activeModal.image} alt={activeModal.title} />
                <div className="modal-content">
                  <p className="modal-type">
                    {activeModal.type === 'project-detail'
                      ? 'Project'
                      : 'Certificate'}
                  </p>
                  <h3 id="modal-title">{activeModal.title}</h3>
                  <p className="modal-subtitle">{activeModal.subtitle}</p>
                  {activeModal.description ? <p>{activeModal.description}</p> : null}
                  {activeModal.tags ? (
                    <div className="project-tags modal-tags">
                      {activeModal.tags.map((item) => (
                        <span key={`${activeModal.title}-${item}`}>{item}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}

            {activeModal.type === 'experience-list' ? (
              <div className="modal-content modal-list-content">
                <p className="modal-type">Experience</p>
                <h3 id="modal-title">All Experience</h3>
                <div className="modal-list-grid modal-list-one">
                  {experiences.map((experience) => (
                    <article key={experience.role} className="experience-card">
                      <div className="experience-head">
                        <h3>{experience.role}</h3>
                        <span className="section-year">{experience.period}</span>
                      </div>
                      <p>{experience.detail}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {activeModal.type === 'projects-list' ? (
              <div className="modal-content modal-list-content">
                <p className="modal-type">Projects</p>
                <h3 id="modal-title">All Projects</h3>
                <div className="modal-list-grid modal-list-two">
                  {projects.map((project) => {
                    const projectImage = getSecureAssetUrl(project.assetId)

                    return (
                      <article key={project.title} className="project-card">
                        <button
                          type="button"
                          className="project-toggle"
                          onClick={() =>
                            openProjectModal({
                              ...project,
                              image: projectImage,
                            })
                          }
                        >
                          <img src={projectImage} alt={project.title} />
                          <div className="project-title-row">
                            <h3>{project.title}</h3>
                            <span>Open</span>
                          </div>
                        </button>
                      </article>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {activeModal.type === 'certificates-list' ? (
              <div className="modal-content modal-list-content">
                <p className="modal-type">Certificates</p>
                <h3 id="modal-title">All Certificates</h3>
                <div className="modal-list-grid modal-list-two">
                  {certificates.map((certificate) => {
                    const certificateImage = getSecureAssetUrl(certificate.assetId)

                    return (
                      <article key={certificate.title} className="certificate-card">
                        <img src={certificateImage} alt={certificate.title} />
                        <div className="certificate-info">
                          <div>
                            <h3>{certificate.title}</h3>
                            <p>{certificate.source}</p>
                          </div>
                          <button
                            type="button"
                            className="view-link"
                            onClick={() =>
                              openCertificateModal({
                                ...certificate,
                                image: certificateImage,
                              })
                            }
                          >
                            Open
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      <div className="chatbot-shell">
        {!isChatOpen && !hasOpenedChat ? (
          <p className="chatbot-invite">Need a quick overview?</p>
        ) : null}

        {isChatOpen ? (
          <section className="chatbot-panel" aria-label="JSI chatbot">
            <div className="chatbot-header">
              <div>
                <h3>JSI Chatbot</h3>
                <p>Portfolio assistant</p>
              </div>
              <button
                type="button"
                className="chatbot-close"
                onClick={() => setIsChatOpen(false)}
                aria-label="Close chatbot"
              >
                <FiX />
              </button>
            </div>

            <div className="chatbot-messages">
              {chatMessages.map((message, index) => (
                <article
                  key={`${message.sender}-${index}`}
                  className={`chat-message ${message.sender}`}
                >
                  <p>{message.text}</p>
                </article>
              ))}
              <div ref={chatMessagesEndRef}></div>
            </div>

            <form
              className="chatbot-form"
              onSubmit={(event) => {
                event.preventDefault()
                sendChatMessage()
              }}
            >
              <input
                type="text"
                value={chatInput}
                maxLength={MAX_CHAT_MESSAGE_LENGTH}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder={
                  isChatSending ? 'Thinking...' : 'Ask about your portfolio...'
                }
                disabled={isChatSending}
              />
              <button
                type="submit"
                className="chatbot-send"
                aria-label="Send"
                disabled={isChatSending || !chatInput.trim()}
              >
                <FiSend />
              </button>
            </form>
          </section>
        ) : (
          <button
            type="button"
            className="chatbot-toggle"
            onClick={() => {
              setHasOpenedChat(true)
              setIsChatOpen(true)
            }}
            aria-label="Open chatbot"
          >
            <FiMessageCircle />
          </button>
        )}
      </div>
    </main>
  )
}

export default App
