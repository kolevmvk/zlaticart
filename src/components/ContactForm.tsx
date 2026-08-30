'use client'

import { useActionState } from 'react'
import { submitContactForm, type ContactFormState } from '@/app/(site)/contact/actions'
import { useLanguage } from '@/context/LanguageContext'

const initialState: ContactFormState = { status: 'idle' }

const fieldClasses =
  'w-full bg-transparent border-b border-canvas-deep py-2 font-sans text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink transition-colors duration-200'

export default function ContactForm() {
  const { t } = useLanguage()
  const [state, formAction, pending] = useActionState(submitContactForm, initialState)

  if (state.status === 'success') {
    return (
      <p className="font-sans text-ink/70 text-sm leading-loose">
        {t.contact.form.success}
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-8">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] w-px h-px opacity-0"
      />

      <div>
        <label htmlFor="name" className="text-label text-ink/40 mb-2 block">
          {t.contact.form.name}
        </label>
        <input id="name" name="name" type="text" required maxLength={120} className={fieldClasses} />
      </div>

      <div>
        <label htmlFor="email" className="text-label text-ink/40 mb-2 block">
          {t.contact.form.email}
        </label>
        <input id="email" name="email" type="email" required maxLength={254} className={fieldClasses} />
      </div>

      <div>
        <label htmlFor="message" className="text-label text-ink/40 mb-2 block">
          {t.contact.form.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={4000}
          rows={5}
          className={`${fieldClasses} resize-none`}
        />
      </div>

      {state.status === 'error' && (
        <p className="font-sans text-sm text-ink/70">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="nav-link text-ink border-b border-ink pb-1 disabled:opacity-40"
      >
        {pending ? t.contact.form.sending : t.contact.form.send}
      </button>
    </form>
  )
}
