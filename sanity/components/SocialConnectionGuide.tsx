// Read-only guided panel shown inside Sanity Studio → Podešavanja.
// Purpose: let Zlatica (no dev knowledge) understand, in plain Serbian, what a
// "Professional/Business account" is and what happens once she has one — without
// her ever needing to touch code or an API. The actual Meta API wiring is a
// one-time technical step the developer does later, in `src/lib/social/provider.ts`,
// once she reports her status here as "connected".
import type { CSSProperties } from 'react'
import type { StringInputProps } from 'sanity'

const steps = {
  instagram: [
    'Otvorite Instagram nalog na telefonu koji vodi vaš profil.',
    'Podešavanja → Nalog → "Pređi na profesionalni nalog" (Switch to Professional Account) → izaberite Creator ili Business.',
    'To je sve što je vama potrebno da uradite. Kad završite, javite osobi koja vam je napravila sajt.',
    'Developer zatim jednokratno poveže taj nalog sa sajtom (potrebno mu je par minuta). Vi samo promenite status ispod u "Povezano automatski" kad vam developer to potvrdi.',
  ],
  facebook: [
    'Napravite Facebook stranicu (Page) posvećenu vašoj umetnosti — ne lični profil.',
    'U Instagram podešavanjima: Nalog → Povezani nalozi (Linked Accounts) → povežite tu Facebook stranicu.',
    'Javite developeru kada je stranica povezana sa Instagram profesionalnim nalogom.',
  ],
}

const noteBoxStyle: CSSProperties = {
  background: 'var(--card-bg-color, #f5f4f2)',
  border: '1px solid var(--card-border-color, #e0ddd6)',
  borderRadius: 6,
  padding: '12px 14px',
  marginBottom: 12,
  fontSize: 13,
  lineHeight: 1.6,
}

function GuideBlock({ platform }: { platform: 'instagram' | 'facebook' }) {
  const title = platform === 'instagram' ? 'Instagram — kako da pređete na profesionalni nalog' : 'Facebook — kako da povežete stranicu'
  return (
    <div style={noteBoxStyle}>
      <strong>{title}</strong>
      <ol style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18 }}>
        {steps[platform].map((step, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            {step}
          </li>
        ))}
      </ol>
      <p style={{ marginTop: 8, marginBottom: 0, color: 'var(--card-muted-fg-color, #6b6862)' }}>
        Dok ovo ne uradite, sajt normalno prikazuje link ka vašem profilu ispod — ništa se ne kvari, samo
        se objave ne povlače same od sebe.
      </p>
    </div>
  )
}

// Attached as `components.input` on a decorative, unstored string field — this
// component never renders an actual text box, so nothing is saved from it.
export function SocialConnectionGuide(_props: StringInputProps) {
  return (
    <div>
      <GuideBlock platform="instagram" />
      <GuideBlock platform="facebook" />
    </div>
  )
}
