'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // No email confirmation required
      emailRedirectTo: undefined,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile row
  if (data.user) {
    await supabase
      .from('profiles')
      .upsert({ id: data.user.id, pubg_id: null })
  }

  revalidatePath('/', 'layout')
  return { success: true, user: data.user }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true, user: data.user }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function updatePubgId(userId: string, pubgId: string) {
  const supabase = await createClient()

  // Verify the user is updating their own ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return { error: 'Unauthorized to update this profile.' }
  }

  // First try to update
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ pubg_id: pubgId, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (updateError) {
    // If update fails (e.g., row doesn't exist), try insert
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId, pubg_id: pubgId, updated_at: new Date().toISOString() })
    
    if (insertError) {
      return { error: insertError.message }
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const { createServiceClient } = await import('@/lib/supabase/server')
  const adminSupabase = createServiceClient()

  const { error } = await adminSupabase.auth.admin.deleteUser(userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
