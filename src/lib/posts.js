import { supabase } from './supabase'

// Spara flera inlägg (bulk insert efter generering)
export async function savePosts(posts, storyType, platform = 'instagram') {
  const rows = posts.map(post => ({
    story_type: storyType,
    status: post.status || 'draft',
    fields: post.fields,
    platform,
  }))

  const { data, error } = await supabase
    .from('posts')
    .insert(rows)
    .select()

  if (error) throw new Error(`Kunde inte spara inlägg: ${error.message}`)
  return data
}

// Hämta inlägg med valfria filter
export async function getPosts({ storyType, status, limit, platform } = {}) {
  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (storyType && storyType !== 'all') {
    query = query.eq('story_type', storyType)
  }
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (platform && platform !== 'all') {
    query = query.eq('platform', platform)
  }
  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw new Error(`Kunde inte hämta inlägg: ${error.message}`)
  return data
}

// Uppdatera enskilt inlägg (inline edit)
export async function updatePost(id, fields) {
  const { data, error } = await supabase
    .from('posts')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Kunde inte uppdatera inlägg: ${error.message}`)
  return data
}

// Ta bort inlägg
export async function deletePost(id) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Kunde inte ta bort inlägg: ${error.message}`)
}
