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

  // Om en källa bara är en URL, hämta textinnehållet
  const resolvedSources = await Promise.all(
    sources.map(async (s) => {
      const trimmed = s.trim()
      if (trimmed.match(/^https?:\/\/\S+$/) && trimmed.length < 300) {
        try {
          const resp = await fetch(trimmed, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CefundBot/1.0)' },
          })
          if (!resp.ok) return s
          const html = await resp.text()
          const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[\s\S]*?<\/nav>/gi, '')
            .replace(/<footer[\s\S]*?<\/footer>/gi, '')
            .replace(/<[^>]+>/g, '\n')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n')
            .trim()
            .slice(0, 10000)
          return text || s
        } catch {
          return s
        }
      }
      return s
    })
  )

  const prompt = `Du skriver Instagram Stories-innehåll för Cefund. Cecilia är grundaren.

VIKTIGT: Använd ENBART information som finns i källorna nedan. Hitta INTE på fakta, siffror, tjänster eller påståenden som inte finns i källmaterialet. Allt innehåll måste kunna spåras tillbaka till en specifik källa. Om källorna inte innehåller tillräckligt med material för 7 unika inlägg, skapa färre men håll kvaliteten.

Skapa upp till 7 inlägg av typen "${typeInfo.name}".

Varje inlägg ska ha dessa fält: ${typeInfo.columns.join(', ')}

Tonläge: ${tone || 'professionell'}

Här är källorna — använd ENBART dessa:
${resolvedSources.map((s, i) => `--- Källa ${i + 1} ---\n${s}`).join('\n\n')}

Svara ENBART med en JSON-array. Varje objekt ska ha ett "fields"-objekt med nycklar som matchar fältnamnen ovan.

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
    const text = data.content?.[0]?.text

    if (!text) {
      return res.status(500).json({ error: 'Tomt svar från AI', debug: JSON.stringify(data).slice(0, 500) })
    }

    // Extrahera JSON från svaret
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Kunde inte tolka AI-svaret', debug: text.slice(0, 500) })
    }

    let parsed
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch (parseErr) {
      return res.status(500).json({ error: 'JSON-parsning misslyckades', debug: jsonMatch[0].slice(0, 500) })
    }

    const posts = parsed.map(item => ({
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
