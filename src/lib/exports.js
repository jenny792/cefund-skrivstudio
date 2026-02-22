import { supabase } from './supabase'

// Logga en export-händelse
export async function logExport(postIds, storyType) {
  const { data, error } = await supabase
    .from('exports')
    .insert([{
      post_ids: postIds,
      story_type: storyType,
    }])
    .select()
    .single()

  if (error) throw new Error(`Kunde inte logga export: ${error.message}`)
  return data
}

// Hämta senaste exports
export async function getExports(limit = 10) {
  const { data, error } = await supabase
    .from('exports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Kunde inte hämta exports: ${error.message}`)
  return data
}
