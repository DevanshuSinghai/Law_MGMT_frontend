/**
 * Micro-Tools admin — per-section field configs.
 *
 * Each section maps to a /api/tools/<endpoint>/ resource. `fields` drives both
 * the table columns (those with list:true) and the create/edit form.
 * Field types: text | textarea | number | select | date | switch | file | image
 */

const COURT_OPTIONS = [
  { value: 'supreme', label: 'Supreme Court' },
  { value: 'high', label: 'High Court' },
  { value: 'district', label: 'District Court' },
];

// Appended to every section.
const COMMON_FIELDS = [
  { name: 'display_order', label: 'Order', type: 'number', default: 0, list: true, width: 80 },
  { name: 'is_active', label: 'Active', type: 'switch', default: true, list: true, width: 90 },
];

export const SECTIONS = {
  judges: {
    title: 'Judges',
    endpoint: 'judges',
    description: 'High Court & District Court judges',
    icon: 'gavel',
    color: '#d46b08',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, list: true },
      { name: 'court', label: 'Court', type: 'select', options: COURT_OPTIONS, required: true, default: 'high', list: true },
      { name: 'designation', label: 'Designation', type: 'text', placeholder: 'e.g. Chief Justice', list: true },
      { name: 'court_name', label: 'Court name', type: 'text', placeholder: 'e.g. Delhi High Court' },
      { name: 'court_room', label: 'Court room', type: 'text' },
      { name: 'link_url', label: 'Video-hearing link', type: 'text', placeholder: 'https://...' },
      { name: 'photo', label: 'Photo', type: 'image' },
      { name: 'state', label: 'State', type: 'text', default: 'Delhi' },
    ],
  },
  bar: {
    title: 'Bar Associations',
    endpoint: 'bar-associations',
    description: 'Association directory with office bearers',
    icon: 'team',
    color: '#531dab',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, list: true },
      { name: 'president_name', label: 'President', type: 'text', list: true },
      { name: 'secretary_name', label: 'Secretary', type: 'text' },
      { name: 'contact_number', label: 'Contact number', type: 'text', list: true },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'city', label: 'City', type: 'text', default: 'Delhi' },
      { name: 'state', label: 'State', type: 'text', default: 'Delhi' },
    ],
  },
  police: {
    title: 'Police',
    endpoint: 'police',
    description: 'Administration officers & police stations',
    icon: 'safety',
    color: '#096dd9',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, list: true, placeholder: 'Officer or station name' },
      { name: 'kind', label: 'Type', type: 'select', required: true, default: 'station', list: true,
        options: [{ value: 'administration', label: 'Administration' }, { value: 'station', label: 'Police Station' }] },
      { name: 'designation', label: 'Designation', type: 'text', list: true },
      { name: 'contact_number', label: 'Contact number', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'district', label: 'District', type: 'text' },
      { name: 'city', label: 'City', type: 'text', default: 'Delhi' },
      { name: 'state', label: 'State', type: 'text', default: 'Delhi' },
    ],
  },
  rosters: {
    title: 'Rosters',
    endpoint: 'rosters',
    description: 'Bail & duty-magistrate rosters',
    icon: 'schedule',
    color: '#d4380d',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, list: true },
      { name: 'kind', label: 'Type', type: 'select', required: true, default: 'bail', list: true,
        options: [{ value: 'bail', label: 'Bail Roster' }, { value: 'duty_magistrate', label: 'Duty Magistrate Roster' }] },
      { name: 'court', label: 'Court', type: 'select', options: COURT_OPTIONS, default: 'high' },
      { name: 'content', label: 'Roster text', type: 'textarea', rows: 5, placeholder: 'Optional — paste the roster table/text' },
      { name: 'file', label: 'File (PDF)', type: 'file', list: true },
      { name: 'effective_from', label: 'Effective from', type: 'date' },
      { name: 'effective_to', label: 'Effective to', type: 'date' },
      { name: 'state', label: 'State', type: 'text', default: 'Delhi' },
    ],
  },
  notices: {
    title: 'Notices & Events',
    endpoint: 'notices',
    description: 'Announcements and upcoming events',
    icon: 'notification',
    color: '#d48806',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, list: true },
      { name: 'kind', label: 'Type', type: 'select', required: true, default: 'notice', list: true,
        options: [{ value: 'notice', label: 'Notice' }, { value: 'event', label: 'Event' }] },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
      { name: 'date', label: 'Date', type: 'date', list: true },
      { name: 'link_url', label: 'Link', type: 'text', placeholder: 'https://...' },
    ],
  },
  calendar: {
    title: 'Court Calendar',
    endpoint: 'court-calendar',
    description: 'Vacations, holidays & calendar entries',
    icon: 'calendar',
    color: '#389e0d',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, list: true },
      { name: 'court', label: 'Court', type: 'select', options: COURT_OPTIONS, default: 'high' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'start_date', label: 'Start date', type: 'date', list: true },
      { name: 'end_date', label: 'End date', type: 'date' },
      { name: 'year', label: 'Year', type: 'number' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'state', label: 'State', type: 'text', default: 'Delhi' },
    ],
  },
  forms: {
    title: 'Misc. Forms',
    endpoint: 'form-templates',
    description: 'Downloadable form & document templates',
    icon: 'file',
    color: '#1d39c4',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, list: true },
      { name: 'category', label: 'Category', type: 'text', list: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'file', label: 'File', type: 'file', required: true, list: true },
    ],
  },
  banners: {
    title: 'Banners',
    endpoint: 'banners',
    description: 'Home-screen slider images',
    icon: 'picture',
    color: '#c41d7f',
    fields: [
      { name: 'title', label: 'Title', type: 'text', list: true },
      { name: 'image', label: 'Image', type: 'image', required: true },
      { name: 'link_url', label: 'Link', type: 'text', placeholder: 'https://...' },
    ],
  },
};

// Merge common fields once.
Object.values(SECTIONS).forEach((s) => { s.fields = [...s.fields, ...COMMON_FIELDS]; });

export const SECTION_ORDER = ['judges', 'bar', 'police', 'rosters', 'notices', 'calendar', 'forms', 'banners'];
