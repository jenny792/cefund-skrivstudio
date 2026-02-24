// Kollar om det finns en giltig LinkedIn-koppling
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metoden stöds ej' })
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    )

    const { data: token } = await supabase
      .from('linkedin_tokens')
      .select('expires_at, linkedin_sub')
      .limit(1)
      .single()

    if (!token) {
      return res.status(200).json({ connected: false })
    }

    const isExpired = new Date(token.expires_at) < new Date()

    return res.status(200).json({
      connected: !isExpired,
      expired: isExpired,
      linkedinSub: token.linkedin_sub,
    })
  } catch (err) {
    return res.status(500).json({ error: `Serverfel: ${err.message}` })
  }
}
