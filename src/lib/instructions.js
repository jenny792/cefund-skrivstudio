import { supabase } from './supabase'

export async function getInstructions() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('instructions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Fel vid hämtning av instruktioner:', error.message)
    return []
  }
  return data
}

export async function addInstruction({ title, content }) {
  if (!supabase) return []
  const { error } = await supabase
    .from('instructions')
    .insert({ title, content })
  if (error) {
    console.error('Fel vid sparande av instruktion:', error.message)
  }
  return getInstructions()
}

export async function updateInstruction(id, fields) {
  if (!supabase) return []
  const { error } = await supabase
    .from('instructions')
    .update(fields)
    .eq('id', id)
  if (error) {
    console.error('Fel vid uppdatering av instruktion:', error.message)
  }
  return getInstructions()
}

export async function deleteInstruction(id) {
  if (!supabase) return []
  const { error } = await supabase
    .from('instructions')
    .delete()
    .eq('id', id)
  if (error) {
    console.error('Fel vid borttagning av instruktion:', error.message)
  }
  return getInstructions()
}
