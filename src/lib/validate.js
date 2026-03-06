// Klientfunktion för compliance-validering av inlägg

export async function validatePosts(posts, instructions) {
  const response = await fetch('/api/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      posts: posts.map(p => ({ fields: p.fields })),
      instructions,
    }),
  })

  if (!response.ok) {
    console.error('Valideringsanrop misslyckades:', response.status)
    // Fallback — returnera unknown för alla
    return posts.map(() => ({ verdict: 'unknown', issues: [] }))
  }

  const data = await response.json()
  return data.results
}
