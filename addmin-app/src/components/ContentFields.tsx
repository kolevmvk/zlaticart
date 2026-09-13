import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import type { ContentField } from '@/api/content'
import { Button, Feedback, Field } from '@/components/ui'
import { ImageField } from '@/components/content/ImageField'
import { ReferenceField } from '@/components/content/ReferenceField'
import { colors } from '@/theme/colors'
import { shape, spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'

type Props = {
  fields: ContentField[]; value: Record<string, unknown>; onChange: (name: string, value: unknown) => void; disabled?: boolean;
  onBusyChange?: (busy: boolean) => void; renderPortableText?: (field: ContentField, value: unknown, onChange: (value: unknown) => void) => ReactNode
}
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
function DateField({ field, value, onChange, disabled }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const text = typeof value === 'string' ? value : ''
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(text)) && new Date(text).toISOString().slice(0, 10) === text
  return <View style={styles.group}>
    <Field label={`${field.title}${field.required ? ' *' : ''}`} value={text} onChangeText={onChange} editable={!disabled} placeholder="GGGG-MM-DD" hint="Datum u obliku 2026-09-13" error={text && !valid ? 'Unesite ispravan datum (GGGG-MM-DD).' : undefined} testID={`field-${field.name}`} />
    <Button label="Izaberi datum iz kalendara" variant="secondary" disabled={disabled} onPress={() => setOpen(true)} testID={`field-${field.name}-calendar`} />
    {text ? <Button label="Ukloni datum" variant="quiet" disabled={disabled} onPress={() => onChange(null)} /> : null}
    {open ? <DateTimePicker value={valid ? new Date(`${text}T12:00:00`) : new Date()} mode="date" onChange={(event, date) => { setOpen(false); if (event.type === 'set' && date) onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`) }} /> : null}
  </View>
}
function NumberField({ field, value, onChange, disabled }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean }) {
  const [raw, setRaw] = useState<string | null>(null)
  const display = raw !== null && (raw === String(value ?? '') || Number(raw.replace(',', '.')) === value) ? raw : String(value ?? '')
  const invalid = display !== '' && (!/^-?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(display) || !Number.isFinite(Number(display.replace(',', '.'))))
  return <Field label={`${field.title}${field.required ? ' *' : ''}`} value={display} editable={!disabled} keyboardType="numbers-and-punctuation" testID={`field-${field.name}`} error={invalid ? 'Unesite ispravan broj.' : undefined} onChangeText={text => { setRaw(text); const normalized = text.replace(',', '.'); onChange(text === '' ? null : /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized) && Number.isFinite(Number(normalized)) ? Number(normalized) : text) }} />
}
export function ContentFields({ fields, value, onChange, disabled, onBusyChange, renderPortableText }: Props) {
  const busyFields = useRef(new Set<string>())
  const notifyBusy = useCallback((name: string, busy: boolean) => { if (busy) busyFields.current.add(name); else busyFields.current.delete(name); onBusyChange?.(busyFields.current.size > 0) }, [onBusyChange])
  return <View style={styles.form}>{fields.map(field => {
    const current = value[field.name]
    const change = (next: unknown) => onChange(field.name, next)
    const label = `${field.title}${field.required ? ' *' : ''}`
    let control: ReactNode
    switch (field.kind) {
      case 'info': control = <Feedback title="Instagram i Facebook" message={'Za automatske objave pređite na Instagram Creator ili Business nalog. Napravite Facebook stranicu za umetnost i povežite je sa Instagram nalogom. Javite osobi koja održava sajt; tek kada potvrdi povezivanje izaberite „Povezano automatski“. Do tada sajt normalno prikazuje ručno unete linkove.'} />; break
      case 'date': control = <DateField field={field} value={current} onChange={change} disabled={disabled} />; break
      case 'number': control = <NumberField field={field} value={current} onChange={change} disabled={disabled} />; break
      case 'image': case 'images': control = <><Text style={styles.label}>{label}</Text><ImageField field={field} value={current} onChange={change} disabled={disabled} onBusyChange={busy => notifyBusy(field.name, busy)} /></>; break
      case 'reference': case 'references': control = <><Text style={styles.label}>{label}</Text><ReferenceField field={field} value={current} onChange={change} disabled={disabled} /></>; break
      case 'boolean': control = <View style={styles.toggle}><Text style={[styles.label, styles.flex]}>{label}</Text><Switch accessibilityLabel={label} accessibilityRole="switch" value={current === true} disabled={disabled} onValueChange={change} trackColor={{ false: colors.canvasDeep, true: colors.inkMuted }} thumbColor={colors.canvas} testID={`field-${field.name}`} /></View>; break
      case 'select': control = <><Text style={styles.label}>{label}</Text>{field.options?.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.title} accessibilityState={{ checked: current === option.value, disabled: Boolean(disabled) }} disabled={disabled} onPress={() => change(option.value)} style={[styles.option, current === option.value && styles.selected]} testID={`field-${field.name}-${option.value}`}><Text style={styles.body}>{current === option.value ? '● ' : '○ '}{option.title}</Text></Pressable>)}{!field.required && current ? <Button label="Ukloni izbor" variant="quiet" disabled={disabled} onPress={() => change(null)} /> : null}</>; break
      case 'portableText': control = <><Text style={styles.label}>{label}</Text>{renderPortableText ? renderPortableText(field, current, change) : <Feedback title="Bogat tekst je sačuvan" message={Array.isArray(current) && current.length ? current.map(block => Array.isArray(object(block).children) ? (object(block).children as unknown[]).map(span => typeof object(span).text === 'string' ? object(span).text : '').join('') : '[Fotografija ili poseban blok]').join('\n\n') : 'Tekst još nije unet.'} />}</>; break
      case 'slug': control = <Field label={label} value={typeof object(current).current === 'string' ? String(object(current).current) : ''} editable={!disabled} autoCapitalize="none" autoCorrect={false} testID={`field-${field.name}`} hint="Adresa stranice. Koristite slova, brojeve i crtice." onChangeText={text => change({ ...object(current), _type: 'slug', current: text })} />; break
      default: control = <Field label={label} value={typeof current === 'string' ? current : ''} editable={!disabled} multiline={field.kind === 'text'} style={field.kind === 'text' ? styles.multiline : undefined} keyboardType={field.kind === 'url' ? 'url' : field.name === 'contactEmail' ? 'email-address' : 'default'} autoCapitalize={field.kind === 'url' || field.name === 'contactEmail' ? 'none' : 'sentences'} autoCorrect={field.kind !== 'url'} testID={`field-${field.name}`} onChangeText={change} hint={field.kind === 'url' ? 'Pun link koji počinje sa https://' : undefined} />
    }
    return <View key={field.name} style={styles.group}>{control}</View>
  })}</View>
}
const styles = StyleSheet.create({ form: { gap: spacing.xl }, group: { gap: spacing.sm }, label: { ...textStyles.label, color: colors.ink }, body: { ...textStyles.body, color: colors.ink }, toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: shape.touchTarget }, flex: { flex: 1 }, option: { minHeight: shape.touchTarget, justifyContent: 'center', padding: spacing.md, borderWidth: 1, borderColor: colors.canvasDeep, borderRadius: shape.radius }, selected: { borderColor: colors.ink, backgroundColor: colors.canvasWarm }, multiline: { minHeight: 120, textAlignVertical: 'top' } })
