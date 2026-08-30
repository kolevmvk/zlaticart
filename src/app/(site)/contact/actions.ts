'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: a field real visitors never see or fill in. Bots that
  // auto-fill every input trip it, and we silently pretend to succeed.
  if (String(formData.get('company') ?? '').trim() !== '') {
    return { status: 'success' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!name || !email || !message) {
    return { status: 'error', message: 'Please fill in every field.' }
  }
  if (!email.includes('@')) {
    return { status: 'error', message: 'Please enter a valid email.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('contact_submissions')
    .insert({ name, email, message })

  if (error) {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }

  return { status: 'success' }
}
