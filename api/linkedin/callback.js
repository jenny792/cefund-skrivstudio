// LinkedIn OAuth2 callback — byter auth code mot access token och sparar i Supabase
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { code, error: oauthError } = req.query

  if (oauthError) {
    return res.redirect(302, '/?linkedin_error=' + encodeURIComponent(oauthError))
  }

  if (!code) {
    return res.redirect(302, '/?linkedin_error=no_code')
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return res.redirect(302, '/?linkedin_error=config_missing')
  }

  try {
    // Byt auth code mot access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('LinkedIn token-fel:', errText)
      return res.redirect(302, '/?linkedin_error=token_failed')
    }

    const tokenData = await tokenRes.json()
    const { access_token, expires_in } = tokenData

    // Hämta användarens LinkedIn-profil (sub)
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    let linkedinSub = null
    if (profileRes.ok) {
      const profile = await profileRes.json()
      linkedinSub = profile.sub
    }

    // Spara token i Supabase
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    )

    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

    // Uppdatera befintlig eller skapa ny
    const { data: existing } = await supabase
      .from('linkedin_tokens')
      .select('id')
      .limit(1)
      .single()

    if (existing) {
      await supabase
        .from('linkedin_tokens')
        .update({ access_token, expires_at: expiresAt, linkedin_sub: linkedinSub })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('linkedin_tokens')
        .insert({ access_token, expires_at: expiresAt, linkedin_sub: linkedinSub })
    }

    return res.redirect(302, '/generera?linkedin_connected=true')
  } catch (err) {
    console.error('LinkedIn callback-fel:', err)
    return res.redirect(302, '/?linkedin_error=server_error')
  }
}
