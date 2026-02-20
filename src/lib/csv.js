import Papa from 'papaparse'

// CSV-kolumner per story-typ
const STORY_COLUMNS = {
  'myt-vs-sanning': ['Myt', 'Sanning', 'Förklaring', 'CTA'],
  'visste-du-att': ['Hook', 'Fakta', 'Förklaring', 'CTA'],
  'fraga-cecilia': ['Fråga', 'Cecilias svar', 'Kontext', 'CTA'],
  'kund-spotlight': ['Rubrik', 'Situation', 'Resultat', 'CTA'],
  'snabbtips': ['Tipsnummer', 'Tips', 'Förklaring', 'CTA'],
  'bakom-siffrorna': ['Siffra', 'Vad den betyder', 'Förklaring', 'CTA'],
  'vad-skulle-du-valja': ['Hook', 'Alternativ A', 'Alternativ B', 'Reveal'],
}

export function getColumnsForType(storyType) {
  return STORY_COLUMNS[storyType] || []
}

export function exportPostsToCSV(posts, storyType) {
  const columns = STORY_COLUMNS[storyType]
  if (!columns) return null

  const rows = posts.map(post => {
    const row = {}
    columns.forEach(col => {
      row[col] = post.fields?.[col] || ''
    })
    return row
  })

  const csv = Papa.unparse(rows, { columns })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${storyType}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export { STORY_COLUMNS }
