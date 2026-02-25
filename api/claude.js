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

const LINKEDIN_TYPE_MAP = {
  'tankeledare': { name: 'Tankeledare', columns: ['Hook', 'Brödtext', 'Avslut', 'CTA'] },
  'tips-insikter': { name: 'Tips & Insikter', columns: ['Hook', 'Tipslista', 'Sammanfattning', 'CTA'] },
  'storytelling': { name: 'Storytelling', columns: ['Hook', 'Berättelse', 'Insikt', 'CTA'] },
  'data-statistik': { name: 'Data & Statistik', columns: ['Hook', 'Siffra', 'Analys', 'CTA'] },
  'fraga-svar': { name: 'Fråga & Svar', columns: ['Fråga', 'Svar', 'Kontext', 'CTA'] },
  'myt-vs-fakta': { name: 'Myt vs Fakta', columns: ['Myt', 'Fakta', 'Förklaring', 'CTA'] },
  'listicle': { name: 'Listicle', columns: ['Rubrik', 'Punktlista', 'Avslut', 'CTA'] },
  'kundberattelse': { name: 'Kundberättelse', columns: ['Rubrik', 'Situation', 'Resultat', 'CTA'] },
}

const NEWSLETTER_TYPE_MAP = {
  'allman': { name: 'Allmänt nyhetsbrev', columns: ['Ämnesrad', 'Hook', 'Huvudinnehåll', 'Tips', 'CTA'] },
  'kund': { name: 'Kundnyhetsbrev', columns: ['Ämnesrad', 'Hook', 'Djupanalys', 'Case/Insikt', 'CTA'] },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoden stöds ej' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY saknas' })
  }

  const { storyType, sources, tone, platform = 'instagram' } = req.body

  const typeMap = platform === 'newsletter' ? NEWSLETTER_TYPE_MAP : platform === 'linkedin' ? LINKEDIN_TYPE_MAP : STORY_TYPE_MAP
  const typeInfo = typeMap[storyType]

  if (!typeInfo) {
    return res.status(400).json({ error: 'Okänd inläggstyp' })
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

  const postCount = platform === 'newsletter' ? 1 : platform === 'linkedin' ? 3 : 7
  const prompt = platform === 'newsletter'
    ? buildNewsletterPrompt(typeInfo, tone, resolvedSources, postCount)
    : platform === 'linkedin'
    ? buildLinkedInPrompt(typeInfo, tone, resolvedSources, postCount)
    : buildInstagramPrompt(typeInfo, tone, resolvedSources, postCount)

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

function buildInstagramPrompt(typeInfo, tone, sources, count) {
  return `Du skriver Instagram Stories-innehåll för Cefund. Cecilia är grundaren.

VIKTIGT: Använd ENBART information som finns i källorna nedan. Hitta INTE på fakta, siffror, tjänster eller påståenden som inte finns i källmaterialet. Allt innehåll måste kunna spåras tillbaka till en specifik källa. Om källorna inte innehåller tillräckligt med material för ${count} unika inlägg, skapa färre men håll kvaliteten.

Skapa upp till ${count} inlägg av typen "${typeInfo.name}".

Varje inlägg ska ha dessa fält: ${typeInfo.columns.join(', ')}

Tonläge: ${tone || 'professionell'}

Här är källorna — använd ENBART dessa:
${sources.map((s, i) => `--- Källa ${i + 1} ---\n${s}`).join('\n\n')}

Svara ENBART med en JSON-array. Varje objekt ska ha ett "fields"-objekt med nycklar som matchar fältnamnen ovan.

Exempel på format:
[
  { "fields": { "${typeInfo.columns[0]}": "...", "${typeInfo.columns[1]}": "...", "${typeInfo.columns[2]}": "...", "${typeInfo.columns[3]}": "..." } }
]`
}

function buildLinkedInPrompt(typeInfo, tone, sources, count) {
  return `Du skriver LinkedIn-inlägg för Cefund. Cecilia är grundaren.

VIKTIGT: Använd ENBART information som finns i källorna nedan. Hitta INTE på fakta, siffror, tjänster eller påståenden som inte finns i källmaterialet. Allt innehåll måste kunna spåras tillbaka till en specifik källa. Om källorna inte innehåller tillräckligt med material för ${count} unika inlägg, skapa färre men håll kvaliteten.

Skapa upp till ${count} LinkedIn-inlägg av typen "${typeInfo.name}".

Varje inlägg ska ha dessa fält: ${typeInfo.columns.join(', ')}

FORMAT-KRAV FÖR LINKEDIN:
- Varje fält ska vara 200-400 tecken (längre än Instagram)
- Använd radbrytningar för läsbarhet
- Använd emojis sparsamt men strategiskt (1-2 per fält)
- Listor med punkter eller siffror där det passar
- Hook-fältet ska vara en stark öppning som fångar uppmärksamhet i flödet
- CTA ska uppmuntra till kommentarer, delningar eller klick
- Skriv för en B2B-publik på LinkedIn

Tonläge: ${tone || 'professionell'}

Här är källorna — använd ENBART dessa:
${sources.map((s, i) => `--- Källa ${i + 1} ---\n${s}`).join('\n\n')}

Svara ENBART med en JSON-array. Varje objekt ska ha ett "fields"-objekt med nycklar som matchar fältnamnen ovan.

Exempel på format:
[
  { "fields": { "${typeInfo.columns[0]}": "...", "${typeInfo.columns[1]}": "...", "${typeInfo.columns[2]}": "...", "${typeInfo.columns[3]}": "..." } }
]`
}

function buildNewsletterPrompt(typeInfo, tone, sources, count) {
  return `Du skriver nyhetsbrev för Cefund. Cecilia är grundaren.

VIKTIGT: Använd ENBART information som finns i källorna nedan. Hitta INTE på fakta, siffror, tjänster eller påståenden som inte finns i källmaterialet. Allt innehåll måste kunna spåras tillbaka till en specifik källa.

Skapa ${count} komplett nyhetsbrev av typen "${typeInfo.name}".

Varje nyhetsbrev ska ha dessa fält: ${typeInfo.columns.join(', ')}

FORMAT-KRAV FÖR NYHETSBREV:
- Ämnesrad: Kort, lockande, max 60 tecken — ska få mottagaren att öppna mailet
- Hook: 1-2 meningar som drar in läsaren direkt (50-100 ord)
- Huvudinnehåll/Djupanalys: Det centrala innehållet (300-600 ord), välskrivet och engagerande
- Tips/Case/Insikt: Konkret och värdefullt (100-200 ord)
- CTA: Tydlig uppmaning till handling — vad ska läsaren göra härnäst?
- Använd radbrytningar och stycken för läsbarhet
- Email-vänlig ton — personlig men professionell
- Skriv som att du pratar direkt till mottagaren

Tonläge: ${tone || 'professionell'}

Här är källorna — använd ENBART dessa:
${sources.map((s, i) => `--- Källa ${i + 1} ---\n${s}`).join('\n\n')}

Svara ENBART med en JSON-array. Varje objekt ska ha ett "fields"-objekt med nycklar som matchar fältnamnen ovan.

Exempel på format:
[
  { "fields": { "${typeInfo.columns[0]}": "...", "${typeInfo.columns[1]}": "...", "${typeInfo.columns[2]}": "...", "${typeInfo.columns[3]}": "...", "${typeInfo.columns[4]}": "..." } }
]`
}
