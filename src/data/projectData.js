export const sharedProjectData = {
  developers: [
    { name: 'John Christian D. Fajutagana', role: 'Full Stack Developer', initials: 'JF', avatarColor: '#265f8f', tag: 'Project Lead' },
    { name: 'Generic Designer', role: 'UI/UX Designer', initials: 'GD', avatarColor: '#4285f4', tag: 'Designer' },
    { name: 'Generic DB Admin', role: 'Database Administrator', initials: 'GB', avatarColor: '#34a853', tag: 'Database' },
  ],
  overview: [
    'Designed and implemented a comprehensive module following clean architecture principles. The system ensures high performance and reliability through modern backend logic.',
    'Focused on creating a practical digital solution that scales with real user needs. The interface maintains consistency across all devices while providing secure and intuitive workflows for different user roles.'
  ],
  objectives: [
    { title: 'Strict Access Control', desc: 'Enforce strict role separation between different account types.' },
    { title: 'Low Friction Flow', desc: 'Provide a clean login and registration flow with low friction onboarding.' },
    { title: 'Secure Recovery', desc: 'Support secure password recovery and account verification.' },
    { title: 'Responsive Design', desc: 'Keep the interface consistent across desktop and mobile views.' },
  ],
  systemUI: {
    'Landing Page': {
      screenshots: [
        { assetId: 'project-1', label: 'Hero and Value Prop' },
        { assetId: 'project-2', label: 'Feature Highlights' },
        { assetId: 'project-3', label: 'Role Preview' },
        { assetId: 'project-4', label: 'Footer Links' },
      ],
      keyPoints: [
        { title: 'Visual Trust', desc: 'High-clarity screens designed for user trust.', color: '#265f8f' },
        { title: 'Conversion Focus', desc: 'Strategically placed CTAs to drive engagement.', color: '#34a853' },
      ]
    },
    'Authentication': {
      screenshots: [
        { assetId: 'project-1', label: 'Login Form' },
        { assetId: 'project-2', label: 'Recovery Flow' },
        { assetId: 'project-3', label: 'Registration Step 1' },
        { assetId: 'project-5', label: 'Account Details' },
      ],
      keyPoints: [
        { title: 'Error Prevention', desc: 'Real-time validation on all fields.', color: '#ea4335' },
        { title: 'Session Security', desc: 'Secure session handling and remember-me support.', color: '#4285f4' },
      ]
    },
    'Administrator': {
      screenshots: [
        { assetId: 'project-2', label: 'Dashboard Overview' },
        { assetId: 'project-4', label: 'User Panel' },
        { assetId: 'project-1', label: 'Role Workflow' },
        { assetId: 'project-3', label: 'Audit Logs' },
      ],
      keyPoints: [
        { title: 'Centralized Control', desc: 'Manage all accounts from a single pane.', color: '#667eea' },
        { title: 'Security Audits', desc: 'Full visibility into system changes.', color: '#764ba2' },
      ]
    },
    'Cashier': {
      screenshots: [
        { assetId: 'project-4', label: 'Operations View' },
        { assetId: 'project-2', label: 'Payment Flow' },
        { assetId: 'project-5', label: 'Customer Lookup' },
        { assetId: 'project-1', label: 'Balance Check' },
      ],
      keyPoints: [
        { title: 'Fast Operations', desc: 'Optimized for high-speed transactions.', color: '#38b2ac' },
        { title: 'Queue Management', desc: 'Efficient handling of multiple customer requests.', color: '#f6ad55' },
      ]
    },
    'Clients': {
      screenshots: [
        { assetId: 'project-1', label: 'Client Home' },
        { assetId: 'project-5', label: 'Profile Settings' },
        { assetId: 'project-3', label: 'Request History' },
        { assetId: 'project-4', label: 'Support Channels' },
      ],
      keyPoints: [
        { title: 'Self Service', desc: 'Empowering users to manage their own data.', color: '#5a67d8' },
        { title: 'Notification Hub', desc: 'Stay updated on request status in real-time.', color: '#ed64a6' },
      ]
    },
    'Guest': {
      screenshots: [
        { assetId: 'project-3', label: 'Guest Landing' },
        { assetId: 'project-2', label: 'FAQ Page' },
        { assetId: 'project-5', label: 'Onboarding Prompt' },
        { assetId: 'project-1', label: 'Inquiry Form' },
      ],
      keyPoints: [
        { title: 'Quick Discovery', desc: 'Explore system benefits without account creation.', color: '#cbd5e0' },
        { title: 'Easy Sign-up', desc: 'Direct paths to registration for interested guests.', color: '#265f8f' },
      ]
    }
  },
  features: [
    { icon: '🧭', title: 'User Experience', desc: 'Login and registration flows include clear field states and visibility toggle.' },
    { icon: '🔐', title: 'Secure Recovery', desc: 'Password reset is delivered only to registered emails with UI confirmation.' },
    { icon: '🧾', title: 'Automated ID', desc: 'Auto-generates unique account IDs based on user role and sequence rules.' },
    { icon: '📨', title: 'Welcome Alerts', desc: 'Newly registered users receive automatic welcome message upon success.' },
    { icon: '🛡️', title: 'Role Segregation', desc: 'Admins, cashiers, and clients are isolated by route guards and permissions.' },
    { icon: '📱', title: 'Responsive UI', desc: 'All screens maintain consistent behavior from mobile to desktop devices.' },
    { icon: '📊', title: 'Live Dashboard', desc: 'Real-time updates on system activity and operational metrics.' },
    { icon: '🔍', title: 'Smart Search', desc: 'Advanced filtering and searching across all data tables and records.' },
  ],
  techStack: [
    { name: 'Laravel', initial: 'L', color: '#ff2d20', reason: 'Used for robust API development and secure session management.' },
    { name: 'React', initial: 'R', color: '#61dafb', reason: 'Selected for building a dynamic, responsive user interface with component reuse.' },
    { name: 'MySQL', initial: 'M', color: '#00758f', reason: 'Chosen for reliable relational data storage and complex query handling.' },
    { name: 'Tailwind CSS', initial: 'T', color: '#38b2ac', reason: 'Utilized for rapid UI prototyping and consistent utility-based styling.' },
  ],
  meta: {
    duration: '4-6 Months',
    teamSize: '3 Developers',
    role: 'Full-stack Developer',
    platform: 'Web Application'
  }
}

export const projects = [
  {
    slug: 'role-based-auth',
    title: 'Role-Based Authentication System',
    year: '2025',
    assetId: 'project-1',
    summary: 'Built a secure, role-based authentication platform with tailored workflows for admin, cashier, client, and guest users.',
    stack: ['Laravel', 'React', 'MySQL'],
    ...sharedProjectData,
  },
  {
    slug: 'barangay-request-tracker',
    title: 'Barangay Request Tracker',
    year: '2025',
    assetId: 'project-2',
    summary: 'Created a web app to manage clearance and request workflows with status updates and printable records.',
    stack: ['Laravel', 'PHP', 'MySQL'],
    ...sharedProjectData,
  },
  {
    slug: 'mindoro-events-hub',
    title: 'Mindoro Campus Events Hub',
    year: '2024',
    assetId: 'project-3',
    summary: 'Developed an events platform for announcements, registration, and attendance monitoring for campus activities.',
    stack: ['React', 'JavaScript', 'CSS'],
    ...sharedProjectData,
  },
  {
    slug: 'inventory-monitoring',
    title: 'Inventory and Asset Monitoring Tool',
    year: '2024',
    assetId: 'project-4',
    summary: 'Designed an internal tool for equipment monitoring, stock movement, and report generation by department.',
    stack: ['Python', 'PHP', 'MySQL'],
    ...sharedProjectData,
  },
  {
    slug: 'portfolio-archive',
    title: 'Portfolio and Certificate Archive',
    year: '2023',
    assetId: 'project-5',
    summary: 'Implemented a personal website that showcases projects, certificates, and profile details with responsive design.',
    stack: ['React', 'HTML', 'CSS'],
    ...sharedProjectData,
  },
]
