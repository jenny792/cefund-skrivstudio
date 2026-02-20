// Delad state för källor via localStorage
const STORAGE_KEY = 'cefund-sources'

export function getSources() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveSources(sources) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources))
}

export function addSource(source) {
  const sources = getSources()
  const updated = [source, ...sources]
  saveSources(updated)
  return updated
}

export function deleteSource(id) {
  const sources = getSources()
  const updated = sources.filter(s => s.id !== id)
  saveSources(updated)
  return updated
}
