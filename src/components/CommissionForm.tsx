'use client'

import { useActionState } from 'react'
import { submitCommissionRequest, type CommissionFormState } from '@/app/(site)/porudzbina/actions'
import { useLanguage } from '@/context/LanguageContext'

const initialState: CommissionFormState = { status: 'idle' }

const fieldClasses =
  'w-full bg-transparent border-b border-canvas-deep py-2 font-sans text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink transition-colors duration-200'

export default function CommissionForm() {
  const { t } = useLanguage()
  const [state, formAction, pending] = useActionState(submitCommissionRequest, initialState)

  if (state.status === 'success') {
    return (
      <p className="font-sans text-ink/70 text-sm leading-loose">
        {t.commission.form.success}
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
        <label htmlFor="c-name" className="text-label text-ink/40 mb-2 block">
          {t.commission.form.name}
        </label>
        <input id="c-name" name="name" type="text" required maxLength={120} className={fieldClasses} />
      </div>

      <div>
        <label htmlFor="c-email" className="text-label text-ink/40 mb-2 block">
          {t.commission.form.email}
        </label>
        <input id="c-email" name="email" type="email" required maxLength={254} className={fieldClasses} />
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <label htmlFor="c-format" className="text-label text-ink/40 mb-2 block">
            {t.commission.form.format}
          </label>
          <input
            id="c-format"
            name="format"
            type="text"
            required
            maxLength={300}
            placeholder={t.commission.form.formatPlaceholder}
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor="c-technique" className="text-label text-ink/40 mb-2 block">
            {t.commission.form.technique}
          </label>
          <input
            id="c-technique"
            name="technique"
            type="text"
            required
            maxLength={300}
            placeholder={t.commission.form.techniquePlaceholder}
            className={fieldClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="c-budget" className="text-label text-ink/40 mb-2 block">
          {t.commission.form.budget}
        </label>
        <input
          id="c-budget"
          name="budget"
          type="text"
          maxLength={200}
          placeholder={t.commission.form.budgetPlaceholder}
          className={fieldClasses}
        />
      </div>

      <div>
        <label htmlFor="c-description" className="text-label text-ink/40 mb-2 block">
          {t.commission.form.description}
        </label>
        <textarea
          id="c-description"
          name="description"
          required
          maxLength={4000}
          rows={6}
          placeholder={t.commission.form.descriptionPlaceholder}
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
        {pending ? t.commission.form.sending : t.commission.form.send}
      </button>
    </form>
  )
}
