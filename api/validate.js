// Vercel serverless function — compliance-validering av genererade inlägg
// Granskar varje inlägg mot instruktioner/regler via Claude API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoden stöds ej' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY saknas' })
  }

  const { posts, instructions } = req.body

  if (!posts?.length) {
    return res.status(400).json({ error: 'Inga inlägg att validera' })
  }

  if (!instructions?.length) {
    // Inga regler att granska mot — allt godkänns
    const results = posts.map(() => ({ verdict: 'pass', issues: [] }))
    return res.status(200).json({ results })
  }

  // Bygg compliance-prompt
  const postsDescription = posts.map((post, i) => {
    const fieldText = Object.entries(post.fields)
      .map(([key, value]) => `  ${key}: ${value}`)
      .join('\n')
    return `--- Inlägg ${i + 1} ---\n${fieldText}`
  }).join('\n\n')

  const rulesDescription = instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')

  const prompt = `Du är en compliance-granskare för marknadsföringsinnehåll. Din uppgift är att granska varje inlägg mot följande regler och instruktioner.

REGLER OCH INSTRUKTIONER:
${rulesDescription}

INLÄGG ATT GRANSKA:
${postsDescription}

Granska varje inlägg noggrant mot VARJE regel ovan. För varje inlägg, avgör:
- "pass" — inlägget följer alla regler
- "warning" — inlägget har mindre avvikelser som bör ses över
- "fail" — inlägget bryter tydligt mot en eller flera regler

Svara ENBART med en JSON-array med ett objekt per inlägg, i samma ordning som inläggen ovan.

Varje objekt ska ha:
- "verdict": "pass", "warning" eller "fail"
- "issues": en array med objekt som har:
  - "rule": kort beskrivning av vilken regel det gäller
  - "detail": specifik förklaring av problemet
  - "field": exakt fältnamn (t.ex. "Hook", "Body", "CTA") där problemet finns
  - "original": den exakta texten/meningen i fältet som bryter mot regeln (kopiera ordagrant från inlägget)
  - "suggestion": en konkret omformulering som ersätter original-texten. Bevara den säljande, engagerande tonen men gör texten compliant.

Tom issues-array om verdict är "pass".

Var strikt men rättvis. Flagga bara faktiska problem, inte stilistiska preferenser. Ge alltid ett konkret suggestion som användaren kan applicera direkt.

Exempel på format:
[
  { "verdict": "pass", "issues": [] },
  { "verdict": "warning", "issues": [{ "rule": "Rättvisande information", "detail": "Kan uppfattas som löfte om avkastning", "field": "Body", "original": "ett kapital som kan leverera även när marknader är volatila", "suggestion": "ett kapital som syftar till att vara mindre känsligt för volatila marknader" }] }
]`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API-fel vid validering:', errorText)
      // Fallback — returnera unknown för alla
      const results = posts.map(() => ({ verdict: 'unknown', issues: [] }))
      return res.status(200).json({ results })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text

    if (!text) {
      const results = posts.map(() => ({ verdict: 'unknown', issues: [] }))
      return res.status(200).json({ results })
    }

    // Extrahera JSON från svaret
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      const results = posts.map(() => ({ verdict: 'unknown', issues: [] }))
      return res.status(200).json({ results })
    }

    let parsed
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      const results = posts.map(() => ({ verdict: 'unknown', issues: [] }))
      return res.status(200).json({ results })
    }

    // Säkerställ att vi har rätt antal resultat
    const results = posts.map((_, i) => {
      const result = parsed[i]
      if (!result || !['pass', 'warning', 'fail'].includes(result.verdict)) {
        return { verdict: 'unknown', issues: [] }
      }
      return {
        verdict: result.verdict,
        issues: Array.isArray(result.issues) ? result.issues : [],
      }
    })

    return res.status(200).json({ results })
  } catch (err) {
    console.error('Valideringsfel:', err)
    // Fallback vid nätverksfel etc.
    const results = posts.map(() => ({ verdict: 'unknown', issues: [] }))
    return res.status(200).json({ results })
  }
}
