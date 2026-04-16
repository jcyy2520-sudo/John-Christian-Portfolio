import { useState, useEffect, useRef } from 'react'
import { FiArrowLeft, FiGithub, FiExternalLink, FiChevronUp, FiChevronDown, FiSun, FiMoon, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './ProjectPage.css'

const ProjectPage = ({ project, theme, setTheme, getSecureAssetUrl, onBack }) => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeTab, setActiveTab] = useState(Object.keys(project.systemUI)[0])
  const [activeSection, setActiveSection] = useState('overview')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200)
  const [isSystemUIExpanded, setIsSystemUIExpanded] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  const sectionRefs = {
    overview: useRef(null),
    objectives: useRef(null),
    features: useRef(null),
    systemUI: useRef(null),
    techStack: useRef(null),
    developers: useRef(null),
  }

  useEffect(() => {
    const handleScroll = () => {
      // Progress bar
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalScroll) * 100
      setScrollProgress(progress)

      // Scroll Spy
      const scrollPos = window.scrollY + 200
      for (const [section, ref] of Object.entries(sectionRefs)) {
        if (ref.current && 
            scrollPos >= ref.current.offsetTop && 
            scrollPos < ref.current.offsetTop + ref.current.offsetHeight) {
          setActiveSection(section)
          break
        }
      }
    }

    const handleResize = () => setIsMobile(window.innerWidth <= 1200)

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const scrollToSection = (sectionId) => {
    const ref = sectionRefs[sectionId]
    if (ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - 100,
        behavior: 'smooth'
      })
    }
  }

  const isDarkMode = theme === 'dark'

  return (
    <div className="project-page-template">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      {/* Clean Header (Replacing Navbar and Hero) */}
      <header className="project-clean-header">
        <div className="header-inner">
          <button className="back-link-simple" onClick={onBack}>
            <FiArrowLeft /> Back to Projects
          </button>
          <div className="title-row">
            <h1>{project.title}</h1>
            <button className="theme-toggle-simple" onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}>
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>
          <p className="project-tagline-simple">{project.summary}</p>
          
          <div className="header-meta-grid">
            <div className="h-meta-item">
              <label>DURATION</label>
              <span>{project.meta.duration}</span>
            </div>
            <div className="h-meta-item">
              <label>TEAM SIZE</label>
              <span>{project.meta.teamSize}</span>
            </div>
            <div className="h-meta-item">
              <label>ROLE</label>
              <span>{project.meta.role}</span>
            </div>
            <div className="h-meta-item">
              <label>PLATFORM</label>
              <span>{project.meta.platform}</span>
            </div>
            <div className="h-meta-item actions">
               <a href="#" className="btn-s btn-p">Demo</a>
               <a href="#" className="btn-s btn-o"><FiGithub /></a>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Nav */}
      {isMobile && (
        <div className="project-mobile-tabs">
          {['overview', 'objectives', 'features', 'systemUI', 'techStack', 'developers'].map(id => (
            <button
              key={id}
              type="button"
              className={`project-mobile-tab ${activeSection === id ? 'active' : ''}`}
              onClick={() => scrollToSection(id)}
            >
              {id === 'systemUI' ? 'System UI' : id === 'techStack' ? 'Tech Stack' : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Main Layout */}
      <div className="project-layout-container">
        {/* Sidebar Nav */}
        {!isMobile && (
          <nav className="project-side-nav" aria-label="Section navigation">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'objectives', label: 'Objectives' },
              { id: 'features', label: 'Features' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`project-side-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </button>
            ))}

            <div className="project-side-nav-parent">
              <button
                type="button"
                className={`project-side-nav-item ${activeSection === 'systemUI' ? 'active' : ''}`}
                onClick={() => {
                  if (activeSection !== 'systemUI') scrollToSection('systemUI')
                  setIsSystemUIExpanded(!isSystemUIExpanded)
                }}
              >
                System UI
                <FiChevronDown className={`project-side-nav-chevron ${isSystemUIExpanded ? 'rotated' : ''}`} />
              </button>
              {isSystemUIExpanded && (
                <div className="project-side-nav-sub">
                  {Object.keys(project.systemUI).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      className={`project-side-nav-sub-item ${activeSection === 'systemUI' && activeTab === tab ? 'active' : ''}`}
                      onClick={() => { scrollToSection('systemUI'); setActiveTab(tab); }}
                    >
                      <span className="sub-dot"></span>
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {[
              { id: 'techStack', label: 'Tech Stack' },
              { id: 'developers', label: 'Developers' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`project-side-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Main Content */}
        <main className="project-main-content">
          {/* Overview Section */}
          <section id="overview" ref={sectionRefs.overview} className="content-section">
            <div className="section-eyebrow">OVERVIEW</div>
            <h2 className="section-title">What is {project.title}?</h2>
            <div className="overview-grid">
              <div className="overview-text">
                {project.overview.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="overview-visual">
                <div className="hero-image-container">
                   <img src={getSecureAssetUrl(project.assetId)} alt={project.title} className="hero-main-img" loading="lazy" />
                   <div className="stat-cards">
                      <div className="stat-card">
                        <span className="stat-value">500+</span>
                        <span className="stat-label">Records</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-value">5</span>
                        <span className="stat-label">User Roles</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* Objectives Section */}
          <section id="objectives" ref={sectionRefs.objectives} className="content-section">
            <div className="section-eyebrow">OBJECTIVES</div>
            <h2 className="section-title">What we set out to build</h2>
            <div className="objectives-list">
              {project.objectives.map((obj, i) => (
                <div key={i} className="objective-card">
                  <span className="obj-number">0{i+1}</span>
                  <div className="obj-content">
                    <h3>{obj.title}</h3>
                    <p>{obj.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section id="features" ref={sectionRefs.features} className="content-section">
            <div className="section-eyebrow">FEATURES</div>
            <h2 className="section-title">Core system capabilities</h2>
            <div className="features-grid">
              {project.features.map((feat, i) => (
                <div key={i} className="feature-card">
                  <div className="feat-icon-box">{feat.icon}</div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* System UI Section */}
          <section id="systemUI" ref={sectionRefs.systemUI} className="content-section">
            <div className="section-eyebrow">SYSTEM UI</div>
            <h2 className="section-title">Interface walkthrough</h2>
            
            <div className="tabs-bar">
              {Object.keys(project.systemUI).map(tab => (
                <button 
                  key={tab} 
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedImageIndex(null);
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="tab-panel-content">
              <div className="marquee-container">
                <div className="marquee-track">
                  {/* Render screenshots twice for infinite loop */}
                  {[...project.systemUI[activeTab].screenshots, ...project.systemUI[activeTab].screenshots].map((ss, i) => (
                    <div 
                      key={i} 
                      className="browser-mockup marquee-item"
                      onClick={() => setSelectedImageIndex(i % project.systemUI[activeTab].screenshots.length)}
                    >
                      <div className="browser-header">
                        <div className="dots">
                          <span className="dot-r"></span>
                          <span className="dot-y"></span>
                          <span className="dot-g"></span>
                        </div>
                        <div className="browser-tab">{ss.label}</div>
                      </div>
                      <div className="browser-body">
                        <img src={getSecureAssetUrl(ss.assetId)} alt={ss.label} loading="lazy" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="key-points-grid">
                {project.systemUI[activeTab].keyPoints.map((kp, i) => (
                  <div key={i} className="key-point-card">
                    <div className="kp-icon" style={{ backgroundColor: kp.color }}></div>
                    <div className="kp-content">
                      <h3>{kp.title}</h3>
                      <p>{kp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>



          {/* Tech Stack Section */}
          <section id="techStack" ref={sectionRefs.techStack} className="content-section">
            <div className="section-eyebrow">TECH STACK</div>
            <h2 className="section-title">Technologies used and why</h2>
            <div className="tech-grid">
              {project.techStack.map((tech, i) => (
                <div key={i} className="tech-card">
                  <div className="tech-icon-box" style={{ color: tech.color, backgroundColor: `${tech.color}15` }}>
                    {tech.initial}
                  </div>
                  <div className="tech-info">
                    <h3>{tech.name}</h3>
                    <p>{tech.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Developers Section */}
          <section id="developers" ref={sectionRefs.developers} className="content-section">
            <div className="section-eyebrow">DEVELOPERS</div>
            <h2 className="section-title">Meet the team</h2>
            <div className="team-grid">
              {project.developers.map((dev, i) => (
                <div key={i} className="team-card">
                  <div className="dev-avatar" style={{ backgroundColor: dev.avatarColor }}>
                    {dev.initials}
                  </div>
                  <h3>{dev.name}</h3>
                  <p>{dev.role}</p>
                  <span className="dev-tag">{dev.tag}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Back to Top */}
          <footer className="project-template-footer">
            <button className="back-to-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <FiChevronUp /> Back to top
            </button>
          </footer>
        </main>
      </div>

      {/* Immersive Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div className="lightbox-overlay" onClick={() => setSelectedImageIndex(null)}>
          <button className="lightbox-close" onClick={() => setSelectedImageIndex(null)}>
            <FiX />
          </button>
          
          <button 
            className="lightbox-nav prev" 
            onClick={(e) => {
              e.stopPropagation();
              const container = document.getElementById('lightbox-scroll');
              if (container) container.scrollBy({ left: -window.innerWidth * 0.8, behavior: 'smooth' });
            }}
          >
            <FiChevronLeft />
          </button>

          <div 
            id="lightbox-scroll"
            className="lightbox-scroll-container" 
            onClick={(e) => e.stopPropagation()}
            ref={(el) => {
               if (el && !el.dataset.scrolled) {
                  // Wait for render then scroll to selected image instantly
                  requestAnimationFrame(() => {
                    const itemWidth = el.children[0]?.offsetWidth || window.innerWidth;
                    el.scrollBy({ left: itemWidth * selectedImageIndex, behavior: 'instant' });
                  });
                  el.dataset.scrolled = 'true';
               }
            }}
          >
            {project.systemUI[activeTab].screenshots.map((ss, idx) => (
              <div key={idx} className="lightbox-item">
                <div className="browser-mockup lightbox-mockup">
                  <div className="browser-header">
                    <div className="dots">
                      <span className="dot-r"></span>
                      <span className="dot-y"></span>
                      <span className="dot-g"></span>
                    </div>
                    <div className="browser-tab">{ss.label}</div>
                  </div>
                  <div className="browser-body">
                    <img 
                      src={getSecureAssetUrl(ss.assetId)} 
                      alt="Full view" 
                    />
                  </div>
                </div>
                <div className="lightbox-caption">
                  {idx + 1} / {project.systemUI[activeTab].screenshots.length} — {ss.label}
                </div>
              </div>
            ))}
          </div>

          <button 
            className="lightbox-nav next" 
            onClick={(e) => {
              e.stopPropagation();
              const container = document.getElementById('lightbox-scroll');
              if (container) container.scrollBy({ left: window.innerWidth * 0.8, behavior: 'smooth' });
            }}
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  )
}

export default ProjectPage
