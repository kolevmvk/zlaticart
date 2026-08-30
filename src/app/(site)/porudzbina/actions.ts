'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export type CommissionFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export async function submitCommissionRequest(
  _prevState: CommissionFormState,
  formData: FormData,
): Promise<CommissionFormState> {
  // Honeypot: a field real visitors never see or fill in. Bots that
  // auto-fill every input trip it, and we silently pretend to succeed.
  if (String(formData.get('company') ?? '').trim() !== '') {
    return { status: 'success' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const format = String(formData.get('format') ?? '').trim()
  const technique = String(formData.get('technique') ?? '').trim()
  const budget = String(formData.get('budget') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()

  if (!name || !email || !format || !technique || !description) {
    return { status: 'error', message: 'Please fill in every required field.' }
  }
  if (!email.includes('@')) {
    return { status: 'error', message: 'Please enter a valid email.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('commission_requests')
    .insert({ name, email, format, technique, budget: budget || null, description })

  if (error) {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }

  return { status: 'success' }
}
