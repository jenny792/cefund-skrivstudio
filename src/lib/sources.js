import { supabase } from './supabase'

export async function getSources() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Fel vid hämtning av källor:', error.message)
    return []
  }
  return data
}

export async function addSource(source) {
  if (!supabase) return []
  const { title, type, content, url } = source
  const { error } = await supabase
    .from('sources')
    .insert({ title, type, content, url })
  if (error) {
    console.error('Fel vid sparande av källa:', error.message)
  }
  return getSources()
}

export async function deleteSource(id) {
  if (!supabase) return []
  const { error } = await supabase
    .from('sources')
    .delete()
    .eq('id', id)
  if (error) {
    console.error('Fel vid borttagning av källa:', error.message)
  }
  return getSources()
}
