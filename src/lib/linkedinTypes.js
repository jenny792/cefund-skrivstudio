// LinkedIn-typ-ID:n för att avgöra plattform från story_type
export const LINKEDIN_TYPE_IDS = new Set([
  'tankeledare', 'tips-insikter', 'storytelling', 'data-statistik',
  'fraga-svar', 'myt-vs-fakta', 'listicle', 'kundberattelse',
])

export function isLinkedInType(storyType) {
  return LINKEDIN_TYPE_IDS.has(storyType)
}

// LinkedIn-inläggstyper med metadata
export const LINKEDIN_TYPES = [
  {
    id: 'tankeledare',
    name: 'Tankeledare',
    description: 'Dela insikter och perspektiv som positionerar dig som expert',
    icon: '🧠',
    columns: ['Hook', 'Brödtext', 'Avslut', 'CTA'],
  },
  {
    id: 'tips-insikter',
    name: 'Tips & Insikter',
    description: 'Praktiska tips som ger värde direkt',
    icon: '💡',
    columns: ['Hook', 'Tipslista', 'Sammanfattning', 'CTA'],
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Berätta en historia som engagerar och inspirerar',
    icon: '📖',
    columns: ['Hook', 'Berättelse', 'Insikt', 'CTA'],
  },
  {
    id: 'data-statistik',
    name: 'Data & Statistik',
    description: 'Lyft fram siffror och data som väcker intresse',
    icon: '📊',
    columns: ['Hook', 'Siffra', 'Analys', 'CTA'],
  },
  {
    id: 'fraga-svar',
    name: 'Fråga & Svar',
    description: 'Svara på vanliga frågor med expertis',
    icon: '💬',
    columns: ['Fråga', 'Svar', 'Kontext', 'CTA'],
  },
  {
    id: 'myt-vs-fakta',
    name: 'Myt vs Fakta',
    description: 'Avliva myter med tydliga fakta',
    icon: '⚡',
    columns: ['Myt', 'Fakta', 'Förklaring', 'CTA'],
  },
  {
    id: 'listicle',
    name: 'Listicle',
    description: 'Strukturerade listor som är lätta att ta till sig',
    icon: '📋',
    columns: ['Rubrik', 'Punktlista', 'Avslut', 'CTA'],
  },
  {
    id: 'kundberattelse',
    name: 'Kundberättelse',
    description: 'Lyft fram kundresultat och framgångshistorier',
    icon: '⭐',
    columns: ['Rubrik', 'Situation', 'Resultat', 'CTA'],
  },
]

// Samma tonlägen som Instagram
export const LINKEDIN_TONES = [
  { id: 'professionell', name: 'Professionell', description: 'Auktoritativ men varm' },
  { id: 'pedagogisk', name: 'Pedagogisk', description: 'Förklarande och tydlig' },
  { id: 'personlig', name: 'Personlig', description: 'Nära och relaterbar' },
  { id: 'energisk', name: 'Energisk', description: 'Engagerande och motiverande' },
]
