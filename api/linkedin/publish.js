// Publicerar ett inlägg till LinkedIn via Posts API
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoden stöds ej' })
  }

  const { postId, text } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text saknas' })
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    )

    // Hämta aktiv token
    const { data: tokenRow } = await supabase
      .from('linkedin_tokens')
      .select('access_token, expires_at, linkedin_sub')
      .limit(1)
      .single()

    if (!tokenRow) {
      return res.status(401).json({ error: 'Ingen LinkedIn-koppling hittades' })
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return res.status(401).json({ error: 'LinkedIn-token har gått ut. Koppla om ditt konto.' })
    }

    const authorUrn = `urn:li:person:${tokenRow.linkedin_sub}`

    // Publicera via LinkedIn Posts API
    const publishRes = await fetch('https://api.linkedin.com/v2/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenRow.access_token}`,
        'LinkedIn-Version': '202401',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: authorUrn,
        commentary: text,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
      }),
    })

    if (!publishRes.ok) {
      const errBody = await publishRes.text()
      console.error('LinkedIn publish-fel:', errBody)
      return res.status(publishRes.status).json({
        error: 'Kunde inte publicera till LinkedIn',
        details: errBody,
      })
    }

    // Uppdatera postens status i Supabase om postId angavs
    if (postId) {
      await supabase
        .from('posts')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', postId)
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: `Serverfel: ${err.message}` })
  }
}
