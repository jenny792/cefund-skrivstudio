// Nyhetsbrev-typ-ID:n för att avgöra plattform från story_type
export const NEWSLETTER_TYPE_IDS = new Set([
  'allman', 'kund', 'custom-newsletter',
])

export function isNewsletterType(storyType) {
  return NEWSLETTER_TYPE_IDS.has(storyType)
}

// Nyhetsbrevtyper med metadata
export const NEWSLETTER_TYPES = [
  {
    id: 'allman',
    name: 'Allmänt nyhetsbrev',
    description: 'Komplett nyhetsbrev för alla prenumeranter',
    icon: '📬',
    columns: ['Ämnesrad', 'Hook', 'Huvudinnehåll', 'Tips', 'CTA'],
  },
  {
    id: 'kund',
    name: 'Kundnyhetsbrev',
    description: 'Exklusiva insikter bara för kunder',
    icon: '💎',
    columns: ['Ämnesrad', 'Hook', 'Djupanalys', 'Case/Insikt', 'CTA'],
  },
  {
    id: 'custom-newsletter',
    name: 'Custom inlägg',
    description: 'Skriv egna instruktioner för skräddarsytt innehåll',
    icon: '✏️',
    columns: [],
  },
]

// Samma tonlägen som övriga plattformar
export const NEWSLETTER_TONES = [
  { id: 'professionell', name: 'Professionell', description: 'Auktoritativ men varm' },
  { id: 'pedagogisk', name: 'Pedagogisk', description: 'Förklarande och tydlig' },
  { id: 'personlig', name: 'Personlig', description: 'Nära och relaterbar' },
  { id: 'energisk', name: 'Energisk', description: 'Engagerande och motiverande' },
]
