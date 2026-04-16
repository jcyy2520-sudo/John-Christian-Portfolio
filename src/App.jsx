import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiCheckCircle,
  FiDownload,
  FiHome,
  FiLayers,
  FiBriefcase,
  FiFolder,
  FiAward,
  FiMail,
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
import Markdown from 'react-markdown'
import { sharedProjectData, projects as projectDataList } from './data/projectData'
import './App.css'
import ProjectPage from './components/ProjectPage'
import PlexusBackground from './components/PlexusBackground'

function useFadeIn(...triggers) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.classList.remove('fade-in-visible') // Reset for re-trigger

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
  }, triggers) // Re-run when any trigger changes

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

const projects = projectDataList

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
      color: '#ea4335',
    },
    {
      key: 'phone',
      title: 'CONTACT US',
      lines: ['+63 966 9036 917'],
      href: contactPhoneHref,
      icon: MdCall,
      external: false,
      color: '#34a853',
    },
    {
      key: 'location',
      title: 'LOCATION',
      lines: ['Poblacion, Bansud', 'Oriental Mindoro, Philippines'],
      href: mapsHref,
      icon: MdLocationOn,
      external: true,
      color: '#4285f4',
    },
  ]

  const socialContactItems = [
    {
      key: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/',
      icon: FaLinkedinIn,
      external: true,
      color: '#0077b5',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: FaInstagram,
      external: true,
      color: '#e1306c',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      href: 'https://www.facebook.com/',
      icon: FaFacebookF,
      external: true,
      color: '#1877f2',
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
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [hasOpenedChat, setHasOpenedChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isChatSending, setIsChatSending] = useState(false)
  const [isChatbotExpanded, setIsChatbotExpanded] = useState(true)
  const [visitorMessage, setVisitorMessage] = useState({
    email: '',
    message: '',
  })
  const [visitorMessageError, setVisitorMessageError] = useState('')
  const [isVisitorMessageSending, setIsVisitorMessageSending] = useState(false)
  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(false)
  const [isCvModalOpen, setIsCvModalOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Hey! I\'m JSI — your portfolio assistant. Got questions about my projects, skills, or experience? Ask away.',
    },
  ])
  const [secureAssetUrls, setSecureAssetUrls] = useState({})
  const [activePreviewImage, setActivePreviewImage] = useState(null)
  const [exhibition, setExhibition] = useState(null)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const chatMessagesEndRef = useRef(null)

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
      // If we navigate, close exhibition and modals
      setExhibition(null)
      setActiveModal(null)
    }

    window.addEventListener('popstate', handleLocationChange)
    
    // Custom navigation handler
    const originalPushState = window.history.pushState
    window.history.pushState = function() {
      originalPushState.apply(this, arguments)
      handleLocationChange()
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.history.pushState = originalPushState
    }
  }, [])

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        if (activePreviewImage) {
          setActivePreviewImage(null)
          return
        }

        setActiveModal(null)
        setIsThankYouModalOpen(false)
        setIsCvModalOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)

    return () => {
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [activePreviewImage])

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
        const response = await fetch('/_srv/asset-token', {
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

  const exhibitionSubtitles = {
    projects: 'A detailed gallery of my work in full-stack development, database architecture, and UI/UX implementation.',
    experience: 'A comprehensive history of my professional journey, internships, and technical training.',
    certificates: 'A collection of official certifications and workshops that validate my technical foundation.',
  }

  const getSecureAssetUrl = (assetId) => {
    if (typeof assetId !== 'string') {
      return IMAGE_FALLBACK_SRC
    }

    return secureAssetUrls[assetId] || IMAGE_FALLBACK_SRC
  }

  const openProjectModal = (project) => {
    navigate(`/projects/${project.slug}`)
  }

  const openCertificateModal = (certificate) => {
    setActiveModal({
      type: 'certificate-detail',
      title: certificate.title,
      subtitle: certificate.source,
      image: certificate.image,
    })
  }

  const openExperienceListExhibition = () => {
    setExhibition({ type: 'experience', title: 'All Experience' })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  const openProjectsListExhibition = () => {
    setExhibition({ type: 'projects', title: 'All Projects' })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  const openCertificatesListExhibition = () => {
    setExhibition({ type: 'certificates', title: 'All Certificates' })
    window.scrollTo({ top: 0, behavior: 'instant' })
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
      const response = await fetch('/_srv/contact', {
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
      const response = await fetch('/_srv/chat', {
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

  useEffect(() => {
    const handleScroll = () => {
      if (isChatOpen) return
      const atTop = window.scrollY < 100
      setIsChatbotExpanded(atTop)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isChatOpen])

  const isDarkMode = theme === 'dark'

  const fadeRefStack = useFadeIn(exhibition, currentPath)
  const fadeRefMain = useFadeIn(exhibition, currentPath)
  const fadeRefCerts = useFadeIn(exhibition, currentPath)
  const fadeRefMessage = useFadeIn(exhibition, currentPath)
  const fadeRefFooter = useFadeIn(exhibition, currentPath)

  const projectMatch = currentPath.match(/^\/projects\/([^/]+)$/)
  const currentProject = projectMatch ? projects.find(p => p.slug === projectMatch[1]) : null

  if (currentProject) {
    return (
      <ProjectPage 
        project={currentProject} 
        theme={theme} 
        setTheme={setTheme} 
        getSecureAssetUrl={getSecureAssetUrl}
        onBack={() => {
          setExhibition({ type: 'projects', title: 'All Projects' })
          navigate('/')
        }}
      />
    )
  }

  return (
    <>
      <PlexusBackground />
      <main className="portfolio-page">
      {exhibition ? (
        <section className={`exhibition-view exhibition-view-${exhibition.type}`}>
          <header className="exhibition-header">
            <button
              className="back-home-link"
              onClick={() => setExhibition(null)}
            >
              <span className="arrow">←</span> Back to Home
            </button>
            <h1>{exhibition.title}</h1>
            <p className="exhibition-subtitle">{exhibitionSubtitles[exhibition.type]}</p>
          </header>

          {exhibition.type === 'experience' && (
            <div className="exhibition-grid-stack">
              {experiences.map((experience) => (
                <article key={experience.role} className="exhibition-card exhibition-card-experience">
                  <div className="exhibition-card-content">
                    <div className="experience-head">
                      <h3>{experience.role}</h3>
                      <span className="section-year education-year experience-year">{experience.period}</span>
                    </div>
                    <p>{experience.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {exhibition.type === 'projects' && (
            <div className="exhibition-grid-gallery">
              {projects.map((project) => {
                const projectImage = getSecureAssetUrl(project.assetId)
                return (
                  <article key={project.title} className="project-card exhibition-card">
                    <button
                      type="button"
                      className="project-toggle"
                      onClick={() => openProjectModal({ ...project, image: projectImage })}
                    >
                      <img src={projectImage} alt={project.title} />
                      <div className="exhibition-card-content">
                        <h3>{project.title}</h3>
                        <p className="exhibition-card-desc">{project.summary}</p>
                        <div className="exhibition-card-actions">
                          <span className="action-link">View details</span>
                        </div>
                      </div>
                    </button>
                  </article>
                )
              })}
            </div>
          )}

          {exhibition.type === 'certificates' && (
            <div className="exhibition-grid-gallery">
              {certificates.map((certificate) => {
                const certificateImage = getSecureAssetUrl(certificate.assetId)
                return (
                  <article key={certificate.title} className="certificate-card exhibition-card">
                    <img src={certificateImage} alt={certificate.title} />
                    <div className="exhibition-card-content">
                      <h3>{certificate.title}</h3>
                      <p className="exhibition-card-desc">{certificate.source}</p>
                      <button
                        type="button"
                        className="view-link exhibition-view-button"
                        onClick={() => openCertificateModal({ ...certificate, image: certificateImage })}
                      >
                        View
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          <nav className="side-nav" aria-label="Section navigation">
            {[
              { icon: FiHome, label: 'Home', target: '.hero-card' },
              { icon: FiLayers, label: 'Tech Stack', target: '.stack-grid' },
              { icon: FiBriefcase, label: 'Experience', action: openExperienceListExhibition },
              { icon: FiFolder, label: 'Projects', action: openProjectsListExhibition },
              { icon: FiAward, label: 'Certificates', action: openCertificatesListExhibition },
              { icon: FiMail, label: 'Contact', target: '.visitor-message-panel' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  className="side-nav-item"
                  onClick={() => item.action ? item.action() : document.querySelector(item.target)?.scrollIntoView({ behavior: 'smooth' })}
                  aria-label={item.label}
                >
                  <Icon className="side-nav-icon" />
                  <span className="side-nav-label">{item.label}</span>
                </button>
              )
            })}
          </nav>

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
                {secureAssetUrls[PROFILE_ASSET_ID] ? (
                  <img src={secureAssetUrls[PROFILE_ASSET_ID]} alt="Profile" />
                ) : null}
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
                <div className="hero-cta-group">
                  <button
                    type="button"
                    className="hero-cta hero-cta-primary"
                    onClick={() => setIsCvModalOpen(true)}
                  >
                    <FiDownload /> Download CV
                  </button>
                  <button
                    type="button"
                    className="hero-cta hero-cta-secondary"
                    onClick={() => {
                      document.querySelector('.visitor-message-panel')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <FiSend /> Contact Me
                  </button>
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
        <section className="panel experience-panel" id="experience-section">
          <div className="section-heading">
            <h2>Experience</h2>
            <button
              className="action-button section-view-button"
              type="button"
              onClick={openExperienceListExhibition}
            >
              View All
            </button>
          </div>
          <div className="experience-list">
            {visibleExperience.map((experience) => (
              <article key={experience.role} className="experience-card">
                <div className="experience-head">
                  <h3>{experience.role}</h3>
                  <span className="section-year education-year experience-year">{experience.period}</span>
                </div>
                <p>{experience.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel education-panel" id="education-section">
          <div className="education-head-row">
            <h2>Education</h2>
            <p className="education-year section-year">2023 - 2027</p>
          </div>
          <div className="education-body">
            <h3>Bachelor of Science in Information Technology</h3>
            <p className="education-campus">Mindoro State University - Bongabong Campus</p>
            <p className="education-location">Labasan, Bongabong, Oriental Mindoro, Philippines</p>
          </div>
          <div className="education-meta" aria-label="Education highlights">
            <span className="education-pill">Undergraduate Program</span>
            <span className="education-pill">Systems and Full-Stack Development Focus</span>
          </div>
        </section>

        <section className="panel projects-panel" id="projects-section">
          <div className="section-heading">
            <h2>Projects</h2>
            <button
              className="action-button section-view-button"
              type="button"
              onClick={openProjectsListExhibition}
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
            onClick={openCertificatesListExhibition}
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
                    className="visitor-contact-row minimal-row"
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                    aria-label={`Open ${item.title}`}
                  >
                    <span className="visitor-contact-row-icon" style={{ color: item.color }} aria-hidden="true">
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
                      style={{ color: item.color }}
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


          </form>
        </div>
      </section>
      </>
      )}

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

      {isCvModalOpen ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setIsCvModalOpen(false)}
        >
          <section
            className="modal-card thank-you-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cv-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close CV modal"
              onClick={() => setIsCvModalOpen(false)}
            >
              <FiX />
            </button>
            <div className="modal-content">
              <div className="thank-you-badge" aria-hidden="true">
                <FiDownload />
              </div>
              <p className="modal-type">CV Download</p>
              <h3 id="cv-title">CV is not available yet.</h3>
              <p>
                The downloadable CV is currently being prepared. Please check back soon or reach out through the contact form below.
              </p>
              <button
                type="button"
                className="action-button thank-you-close"
                onClick={() => setIsCvModalOpen(false)}
              >
                Got it
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {activeModal ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => {
            setActivePreviewImage(null)
            setActiveModal(null)
          }}
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
              onClick={() => {
                setActivePreviewImage(null)
                setActiveModal(null)
              }}
            >
              <FiX />
            </button>
            {activeModal.type === 'project-detail' ||
            activeModal.type === 'certificate-detail' ? (
              <div className="modal-scroll-area">
                <img
                  src={activeModal.image}
                  alt={activeModal.title}
                  className="modal-cover-img"
                />
                <div className="modal-content">
                  <p className="modal-type">
                    {activeModal.type === 'project-detail'
                      ? 'Project'
                      : 'Certificate'}
                  </p>
                  <div className="modal-title-row">
                    <span className="modal-title-filler" aria-hidden="true"></span>
                    <h3 id="modal-title" className="modal-main-title">{activeModal.title}</h3>
                    <p className="modal-subtitle modal-year">{activeModal.subtitle}</p>
                  </div>
                  
                  {activeModal.description ? <p className="modal-summary-text">{activeModal.description}</p> : null}
                  
                  {activeModal.tags ? (
                    <div className="project-tags modal-tags">
                      {activeModal.tags.map((item) => (
                        <span key={`${activeModal.title}-${item}`}>{item}</span>
                      ))}
                    </div>
                  ) : null}

                  {activeModal.data?.overview && (
                    <div className="modal-detail-section">
                      <h4>System Overview</h4>
                      <p>{activeModal.data.overview}</p>
                    </div>
                  )}

                  {activeModal.data?.objectives && (
                    <div className="modal-detail-section">
                      <h4>Objectives</h4>
                      <ul className="modal-list">
                        {activeModal.data.objectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeModal.data?.showcase?.length ? (
                    (() => {
                      const selectedIndex = Math.min(
                        activeShowcaseIndex,
                        activeModal.data.showcase.length - 1,
                      )
                      const selectedSection = activeModal.data.showcase[selectedIndex]

                      return (
                        <div className="modal-showcase">
                          <div className="showcase-tab-list" role="tablist" aria-label="Project UI categories">
                            {activeModal.data.showcase.map((section, idx) => (
                              <button
                                key={`${section.title}-${idx}`}
                                type="button"
                                role="tab"
                                aria-selected={selectedIndex === idx}
                                className={`showcase-tab-button ${selectedIndex === idx ? 'active' : ''}`}
                                onClick={() => setActiveShowcaseIndex(idx)}
                              >
                                {section.title}
                              </button>
                            ))}
                          </div>
                          <div className="showcase-head">
                            <h4 className="showcase-section-title">{selectedSection.title}</h4>
                            {selectedSection.description ? (
                              <p className="showcase-section-note">{selectedSection.description}</p>
                            ) : null}
                          </div>

                          <div className="showcase-grid-dual">
                            {selectedSection.images.slice(0, 4).map((imageItem, i) => {
                              const normalizedImage =
                                typeof imageItem === 'string'
                                  ? {
                                      assetId: imageItem,
                                      label: `${selectedSection.title} screen ${i + 1}`,
                                    }
                                  : imageItem

                              const imageSrc =
                                typeof normalizedImage?.src === 'string' &&
                                normalizedImage.src
                                  ? normalizedImage.src
                                  : getSecureAssetUrl(
                                      normalizedImage?.assetId ||
                                        activeModal.data.assetId,
                                    )

                              const imageLabel =
                                typeof normalizedImage?.label === 'string' &&
                                normalizedImage.label
                                  ? normalizedImage.label
                                  : `${selectedSection.title} screen ${i + 1}`

                              return (
                                <figure key={i} className="showcase-img-box">
                                  <button
                                    type="button"
                                    className="showcase-img-trigger"
                                    onClick={() =>
                                      setActivePreviewImage({
                                        src: imageSrc,
                                        alt: `${selectedSection.title} - ${imageLabel}`,
                                        caption: imageLabel,
                                      })
                                    }
                                    aria-label={`Expand preview: ${imageLabel}`}
                                  >
                                    <img
                                      src={imageSrc}
                                      alt={`${selectedSection.title} - ${imageLabel}`}
                                      loading="lazy"
                                    />
                                  </button>
                                  <figcaption className="showcase-img-caption">
                                    {imageLabel}
                                  </figcaption>
                                </figure>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()
                  ) : null}

                  {activeModal.data?.features && (
                    <ul className="modal-features-list">
                      {activeModal.data.features.map((feature, i) => (
                        <li key={i} className="modal-feature-line">
                          <span className="feature-icon">{feature.icon}</span>
                          <p>
                            <strong>{feature.title}:</strong> {feature.desc}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {activeModal.data?.developers && (
                    <p className="developers-row">Developers: {activeModal.data.developers.join(', ')}</p>
                  )}
                </div>
              </div>
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
                        <span className="section-year education-year experience-year">{experience.period}</span>
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

      {activePreviewImage ? (
        <div
          className="lightbox-overlay"
          role="presentation"
          onClick={() => setActivePreviewImage(null)}
        >
          <section
            className="lightbox-card"
            role="dialog"
            aria-modal="true"
            aria-label="Expanded project UI image"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close"
              aria-label="Close image preview"
              onClick={() => setActivePreviewImage(null)}
            >
              <FiX />
            </button>
            <img
              src={activePreviewImage.src}
              alt={activePreviewImage.alt}
              className="lightbox-image"
            />
            <p className="lightbox-caption">{activePreviewImage.caption}</p>
          </section>
        </div>
      ) : null}

      <div className="chatbot-shell">
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
                  {message.sender === 'bot' ? (
                    <Markdown>{message.text}</Markdown>
                  ) : (
                    <p>{message.text}</p>
                  )}
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
            className={`chatbot-toggle ${isChatbotExpanded ? 'chatbot-toggle-expanded' : ''}`}
            onClick={() => {
              setHasOpenedChat(true)
              setIsChatOpen(true)
            }}
            aria-label="Open chatbot"
          >
            {isChatbotExpanded && (
              <span className="chatbot-toggle-label">Ask me anything</span>
            )}
            <FiMessageCircle />
          </button>
        )}
      </div>
    </main>
    </>
  )
}

export default App
