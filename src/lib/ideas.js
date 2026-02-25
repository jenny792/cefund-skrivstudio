import { supabase } from './supabase'

// Hämta alla idéer, sorterat nyast först
export async function getIdeas() {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Kunde inte hämta idéer: ${error.message}`)
  return data
}

// Skapa ny idé
export async function createIdea({ title, description, tags }) {
  const { data, error } = await supabase
    .from('ideas')
    .insert({ title, description, tags: tags || [] })
    .select()
    .single()

  if (error) throw new Error(`Kunde inte skapa idé: ${error.message}`)
  return data
}

// Radera idé
export async function deleteIdea(id) {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Kunde inte ta bort idé: ${error.message}`)
}
