// LinkedIn API-anrop (status, publicering)

export async function getLinkedInStatus() {
  const res = await fetch('/api/linkedin/status')
  if (!res.ok) throw new Error('Kunde inte hämta LinkedIn-status')
  return res.json()
}

export async function publishToLinkedIn(postId, text) {
  const res = await fetch('/api/linkedin/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, text }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Kunde inte publicera till LinkedIn')
  }

  return res.json()
}

export function startLinkedInAuth() {
  window.location.href = '/api/linkedin/auth'
}
