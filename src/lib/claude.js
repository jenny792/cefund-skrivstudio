// Anropa Claude API via Vercel serverless proxy
export async function generatePosts({ storyType, sources, tone }) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyType, sources, tone }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Fel vid generering: ${error}`)
  }

  return res.json()
}
