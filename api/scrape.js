// Vercel serverless function — hämta textinnehåll från en URL
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoden stöds ej' })
  }

  const { url } = req.body
  if (!url) {
    return res.status(400).json({ error: 'URL saknas' })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CefundBot/1.0)',
      },
    })

    if (!response.ok) {
      return res.status(400).json({ error: `Kunde inte hämta sidan (${response.status})` })
    }

    const html = await response.text()

    // Ta bort HTML-taggar, scripts, styles och extrahera ren text
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim()
      .slice(0, 10000) // Begränsa till 10k tecken

    if (!text) {
      return res.status(400).json({ error: 'Kunde inte extrahera text från sidan' })
    }

    return res.status(200).json({ content: text })
  } catch (err) {
    return res.status(500).json({ error: `Fel vid hämtning: ${err.message}` })
  }
}
