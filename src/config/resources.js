/**
 * Content-type definitions for the CMS admin.
 * Each entry drives the list screen, the edit form and the preview for that type.
 * Field names match the backend models (app/models.py).
 */
const status = { name: 'status', type: 'hidden' }
const order = { name: 'display_order', label: 'Display order', type: 'number', help: 'Lower numbers show first' }

export const RESOURCES = {
  projects: {
    label: 'Projects', singular: 'Project', icon: '🚀', color: 'from-violet-500 to-fuchsia-500',
    titleField: 'title', subtitleField: 'summary', imageField: 'image',
    badges: (i) => [i.featured && '⭐ Featured', i.category].filter(Boolean),
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug (URL)', type: 'text', help: 'Leave empty to generate from the title' },
      { name: 'category', label: 'Category', type: 'text', placeholder: 'Full-Stack, Web App…' },
      { name: 'summary', label: 'Short summary', type: 'textarea', rows: 2, full: true },
      { name: 'description', label: 'Description (Markdown)', type: 'markdown', full: true },
      { name: 'image', label: 'Cover image', type: 'image', full: true },
      { name: 'tech_stack', label: 'Tech stack', type: 'tags', full: true, placeholder: 'React, Flask, PostgreSQL' },
      { name: 'github_url', label: 'GitHub URL', type: 'url' },
      { name: 'live_url', label: 'Live demo URL', type: 'url' },
      { name: 'featured', label: 'Featured on home page', type: 'boolean' },
      order, status,
    ],
  },
  skills: {
    label: 'Skills', singular: 'Skill', icon: '⚡', color: 'from-cyan-500 to-blue-500',
    titleField: 'name', subtitleField: 'category', emojiField: 'icon',
    badges: (i) => [`${i.proficiency}%`],
    fields: [
      { name: 'name', label: 'Skill name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', placeholder: 'Frontend, Backend, Tools…' },
      { name: 'proficiency', label: 'Proficiency', type: 'range', min: 0, max: 100, full: true },
      { name: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: '🐍' },
      { name: 'color', label: 'Colour', type: 'color' },
      order, status,
    ],
  },
  blogs: {
    label: 'Blog Posts', singular: 'Blog post', icon: '✍️', color: 'from-orange-400 to-pink-500',
    titleField: 'title', subtitleField: 'excerpt', imageField: 'cover_image',
    badges: (i) => [i.featured && '⭐ Featured', i.published_at, `${i.read_time} min read`].filter(Boolean),
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug (URL)', type: 'text', help: 'Leave empty to generate from the title' },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2, full: true },
      { name: 'content', label: 'Content (Markdown)', type: 'markdown', required: true, full: true, rows: 14 },
      { name: 'cover_image', label: 'Cover image', type: 'image', full: true },
      { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'python, flask, cms' },
      { name: 'published_at', label: 'Publish date', type: 'date' },
      { name: 'featured', label: 'Featured post', type: 'boolean' },
      status,
    ],
  },
  experience: {
    label: 'Experience', singular: 'Experience', icon: '💼', color: 'from-emerald-500 to-teal-500',
    titleField: 'position', subtitleField: 'company', imageField: 'company_logo',
    badges: (i) => [i.employment_type, `${i.start_date} → ${i.current ? 'Present' : i.end_date || '—'}`],
    fields: [
      { name: 'position', label: 'Position / role', type: 'text', required: true },
      { name: 'company', label: 'Company', type: 'text', required: true },
      { name: 'employment_type', label: 'Type', type: 'select', options: ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract'] },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'start_date', label: 'Start (month)', type: 'month', required: true },
      { name: 'end_date', label: 'End (month)', type: 'month' },
      { name: 'current', label: 'I currently work here', type: 'boolean', full: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, full: true },
      { name: 'company_logo', label: 'Company logo', type: 'image', full: true },
      order, status,
    ],
  },
  education: {
    label: 'Education', singular: 'Education', icon: '🎓', color: 'from-indigo-500 to-violet-500',
    titleField: 'degree', subtitleField: 'institution',
    badges: (i) => [`${i.start_year || ''} – ${i.end_year || ''}`, i.grade].filter(Boolean),
    fields: [
      { name: 'degree', label: 'Degree', type: 'text', required: true },
      { name: 'field', label: 'Field of study', type: 'text' },
      { name: 'institution', label: 'Institution', type: 'text', required: true, full: true },
      { name: 'start_year', label: 'Start year', type: 'number' },
      { name: 'end_year', label: 'End year', type: 'number' },
      { name: 'grade', label: 'Grade / CGPA', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3, full: true },
      order, status,
    ],
  },
  testimonials: {
    label: 'Testimonials', singular: 'Testimonial', icon: '💬', color: 'from-pink-500 to-rose-500',
    titleField: 'name', subtitleField: 'content', imageField: 'avatar', round: true,
    badges: (i) => ['★'.repeat(i.rating || 0), i.company].filter(Boolean),
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'rating', label: 'Rating', type: 'select', options: [5, 4, 3, 2, 1] },
      { name: 'content', label: 'Testimonial', type: 'textarea', rows: 4, required: true, full: true },
      { name: 'avatar', label: 'Photo', type: 'image', full: true },
      order, status,
    ],
  },
  services: {
    label: 'Services', singular: 'Service', icon: '🛠️', color: 'from-amber-400 to-orange-500',
    titleField: 'title', subtitleField: 'description', emojiField: 'icon',
    badges: (i) => [i.price].filter(Boolean),
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'price', label: 'Price (optional)', type: 'text', placeholder: 'From ₹10,000' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, required: true, full: true },
      { name: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: '💻' },
      { name: 'color', label: 'Colour', type: 'color' },
      order, status,
    ],
  },
  'social-links': {
    label: 'Social Links', singular: 'Social link', icon: '🔗', color: 'from-sky-400 to-cyan-500',
    titleField: 'platform', subtitleField: 'url', emojiField: 'icon',
    badges: () => [],
    fields: [
      { name: 'platform', label: 'Platform', type: 'text', required: true, placeholder: 'GitHub' },
      { name: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: '🐙' },
      { name: 'url', label: 'URL', type: 'url', required: true, full: true },
      order, status,
    ],
  },
}

export const ABOUT_FIELDS = [
  { name: 'name', label: 'Full name', type: 'text', required: true },
  { name: 'title', label: 'Headline / job title', type: 'text', required: true },
  { name: 'tagline', label: 'Tagline (hero text)', type: 'textarea', rows: 2, full: true },
  { name: 'bio', label: 'Bio (Markdown)', type: 'markdown', rows: 8, full: true },
  { name: 'profile_image', label: 'Profile photo', type: 'image', full: true },
  { name: 'resume_url', label: 'Resume (PDF)', type: 'file', full: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'years_experience', label: 'Years of experience', type: 'number' },
  { name: 'projects_completed', label: 'Projects completed', type: 'number' },
  { name: 'happy_clients', label: 'Happy clients', type: 'number' },
  { name: 'available_for_work', label: 'Available for work', type: 'boolean', full: true },
]
