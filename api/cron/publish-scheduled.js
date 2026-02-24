// Cron job — publicerar schemalagda LinkedIn-inlägg
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Vercel cron skickar en authorization header
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Obehörig' })
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    )

    // Hämta schemalagda inlägg vars tid har passerat
    const { data: scheduledPosts, error: fetchErr } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'scheduled')
      .eq('platform', 'linkedin')
      .lte('scheduled_at', new Date().toISOString())

    if (fetchErr) {
      return res.status(500).json({ error: fetchErr.message })
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return res.status(200).json({ message: 'Inga schemalagda inlägg att publicera', published: 0 })
    }

    // Hämta LinkedIn-token
    const { data: tokenRow } = await supabase
      .from('linkedin_tokens')
      .select('access_token, expires_at, linkedin_sub')
      .limit(1)
      .single()

    if (!tokenRow || new Date(tokenRow.expires_at) < new Date()) {
      return res.status(200).json({ error: 'Ingen giltig LinkedIn-token', published: 0 })
    }

    const authorUrn = `urn:li:person:${tokenRow.linkedin_sub}`
    let published = 0
    const errors = []

    for (const post of scheduledPosts) {
      const text = Object.values(post.fields).join('\n\n')

      try {
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

        if (publishRes.ok) {
          await supabase
            .from('posts')
            .update({ status: 'published', published_at: new Date().toISOString() })
            .eq('id', post.id)
          published++
        } else {
          const errText = await publishRes.text()
          errors.push({ postId: post.id, error: errText })
        }
      } catch (err) {
        errors.push({ postId: post.id, error: err.message })
      }
    }

    return res.status(200).json({ published, errors: errors.length > 0 ? errors : undefined })
  } catch (err) {
    return res.status(500).json({ error: `Serverfel: ${err.message}` })
  }
}
