// Vercel serverless function — proxy för Claude API
// Kräver env-variabel ANTHROPIC_API_KEY i Vercel

const STORY_TYPE_MAP = {
  'myt-vs-sanning': { name: 'Myt vs Sanning', columns: ['Myt', 'Sanning', 'Förklaring', 'CTA'] },
  'visste-du-att': { name: 'Visste du att...', columns: ['Hook', 'Fakta', 'Förklaring', 'CTA'] },
  'fraga-cecilia': { name: 'Fråga Cecilia', columns: ['Fråga', 'Cecilias svar', 'Kontext', 'CTA'] },
  'kund-spotlight': { name: 'Kund-spotlight', columns: ['Rubrik', 'Situation', 'Resultat', 'CTA'] },
  'snabbtips': { name: 'Snabbtips', columns: ['Tipsnummer', 'Tips', 'Förklaring', 'CTA'] },
  'bakom-siffrorna': { name: 'Bakom siffrorna', columns: ['Siffra', 'Vad den betyder', 'Förklaring', 'CTA'] },
  'vad-skulle-du-valja': { name: 'Vad skulle du välja?', columns: ['Hook', 'Alternativ A', 'Alternativ B', 'Reveal'] },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoden stöds ej' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY saknas' })
  }

  const { storyType, sources, tone } = req.body
  const typeInfo = STORY_TYPE_MAP[storyType]

  if (!typeInfo) {
    return res.status(400).json({ error: 'Okänd story-typ' })
  }

  const prompt = `Du är en expert på att skriva Instagram Stories-innehåll för Cefund, ett företag som hjälper andra företag med ekonomi och rådgivning. Cecilia är grundaren.

Skapa exakt 7 inlägg av typen "${typeInfo.name}".

Varje inlägg ska ha dessa fält: ${typeInfo.columns.join(', ')}

Tonläge: ${tone || 'professionell'}

Basera innehållet på dessa källor:
${sources.map((s, i) => `--- Källa ${i + 1} ---\n${s}`).join('\n\n')}

Svara ENBART med en JSON-array med 7 objekt. Varje objekt ska ha ett "fields"-objekt med nycklar som matchar fältnamnen ovan.

Exempel på format:
[
  { "fields": { "${typeInfo.columns[0]}": "...", "${typeInfo.columns[1]}": "...", "${typeInfo.columns[2]}": "...", "${typeInfo.columns[3]}": "..." } }
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return res.status(response.status).json({ error })
    }

    const data = await response.json()
    const text = data.content[0].text

    // Extrahera JSON från svaret
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Kunde inte tolka AI-svaret' })
    }

    const posts = JSON.parse(jsonMatch[0]).map(item => ({
      id: crypto.randomUUID(),
      story_type: storyType,
      status: 'draft',
      fields: item.fields,
    }))

    return res.status(200).json({ posts })
  } catch (err) {
    return res.status(500).json({ error: `Serverfel: ${err.message}` })
  }
}
