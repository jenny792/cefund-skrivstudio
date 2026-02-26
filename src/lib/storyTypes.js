// Alla story-typer med metadata
export const STORY_TYPES = [
  {
    id: 'myt-vs-sanning',
    name: 'Myt vs Sanning',
    description: 'Avliva vanliga missförstånd med fakta',
    icon: '⚡',
    columns: ['Myt', 'Sanning', 'Förklaring', 'CTA'],
  },
  {
    id: 'visste-du-att',
    name: 'Visste du att...',
    description: 'Dela intressanta fakta som engagerar',
    icon: '💡',
    columns: ['Hook', 'Fakta', 'Förklaring', 'CTA'],
  },
  {
    id: 'fraga-cecilia',
    name: 'Fråga Cecilia',
    description: 'Svara på vanliga frågor med expertis',
    icon: '💬',
    columns: ['Fråga', 'Cecilias svar', 'Kontext', 'CTA'],
  },
  {
    id: 'kund-spotlight',
    name: 'Kund-spotlight',
    description: 'Lyft fram kundberättelser och resultat',
    icon: '⭐',
    columns: ['Rubrik', 'Situation', 'Resultat', 'CTA'],
  },
  {
    id: 'snabbtips',
    name: 'Snabbtips',
    description: 'Korta, actionbara tips',
    icon: '🎯',
    columns: ['Tipsnummer', 'Tips', 'Förklaring', 'CTA'],
  },
  {
    id: 'bakom-siffrorna',
    name: 'Bakom siffrorna',
    description: 'Förklara siffror och statistik som berör',
    icon: '📊',
    columns: ['Siffra', 'Vad den betyder', 'Förklaring', 'CTA'],
  },
  {
    id: 'vad-skulle-du-valja',
    name: 'Vad skulle du välja?',
    description: 'Interaktiva val som skapar engagemang',
    icon: '🤔',
    columns: ['Hook', 'Alternativ A', 'Alternativ B', 'Reveal'],
  },
  {
    id: 'custom',
    name: 'Custom inlägg',
    description: 'Skriv egna instruktioner för skräddarsytt innehåll',
    icon: '✏️',
    columns: [],
  },
]

export const TONES = [
  { id: 'professionell', name: 'Professionell', description: 'Auktoritativ men varm' },
  { id: 'pedagogisk', name: 'Pedagogisk', description: 'Förklarande och tydlig' },
  { id: 'personlig', name: 'Personlig', description: 'Nära och relaterbar' },
  { id: 'energisk', name: 'Energisk', description: 'Engagerande och motiverande' },
]
