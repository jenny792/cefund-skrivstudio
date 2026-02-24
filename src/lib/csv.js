import Papa from 'papaparse'

// CSV-kolumner per story-typ (Instagram)
const STORY_COLUMNS = {
  'myt-vs-sanning': ['Myt', 'Sanning', 'Förklaring', 'CTA'],
  'visste-du-att': ['Hook', 'Fakta', 'Förklaring', 'CTA'],
  'fraga-cecilia': ['Fråga', 'Cecilias svar', 'Kontext', 'CTA'],
  'kund-spotlight': ['Rubrik', 'Situation', 'Resultat', 'CTA'],
  'snabbtips': ['Tipsnummer', 'Tips', 'Förklaring', 'CTA'],
  'bakom-siffrorna': ['Siffra', 'Vad den betyder', 'Förklaring', 'CTA'],
  'vad-skulle-du-valja': ['Hook', 'Alternativ A', 'Alternativ B', 'Reveal'],
}

// CSV-kolumner per LinkedIn-typ
const LINKEDIN_COLUMNS = {
  'tankeledare': ['Hook', 'Brödtext', 'Avslut', 'CTA'],
  'tips-insikter': ['Hook', 'Tipslista', 'Sammanfattning', 'CTA'],
  'storytelling': ['Hook', 'Berättelse', 'Insikt', 'CTA'],
  'data-statistik': ['Hook', 'Siffra', 'Analys', 'CTA'],
  'fraga-svar': ['Fråga', 'Svar', 'Kontext', 'CTA'],
  'myt-vs-fakta': ['Myt', 'Fakta', 'Förklaring', 'CTA'],
  'listicle': ['Rubrik', 'Punktlista', 'Avslut', 'CTA'],
  'kundberattelse': ['Rubrik', 'Situation', 'Resultat', 'CTA'],
}

export function getColumnsForType(storyType, platform = 'instagram') {
  const map = platform === 'linkedin' ? LINKEDIN_COLUMNS : STORY_COLUMNS
  return map[storyType] || []
}

export function exportPostsToCSV(posts, storyType, platform = 'instagram') {
  const map = platform === 'linkedin' ? LINKEDIN_COLUMNS : STORY_COLUMNS
  const columns = map[storyType]
  if (!columns) return null

  const rows = posts.map(post => {
    const row = {}
    columns.forEach(col => {
      row[col] = post.fields?.[col] || ''
    })
    return row
  })

  const prefix = platform === 'linkedin' ? 'linkedin' : storyType
  const csv = Papa.unparse(rows, { columns })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${prefix}-${storyType}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export { STORY_COLUMNS, LINKEDIN_COLUMNS }
