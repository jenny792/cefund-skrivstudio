// Startar LinkedIn OAuth2-flöde — redirectar till LinkedIn
export default function handler(req, res) {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'LinkedIn-konfiguration saknas' })
  }

  const scopes = ['openid', 'profile', 'w_member_social', 'email'].join(' ')
  const state = crypto.randomUUID()

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('state', state)

  return res.redirect(302, authUrl.toString())
}
