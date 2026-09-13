import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import type { ContentField } from '@/api/content'
import { Chip, Icon } from '@/components/atelier'
import { ImageField } from '@/components/content/ImageField'
import { ReferenceField } from '@/components/content/ReferenceField'
import { colors } from '@/theme/colors'
import { textStyles } from '@/theme/typography'

type Props = {
  fields: ContentField[]; value: Record<string, unknown>; onChange: (name: string, value: unknown) => void; disabled?: boolean;
  onBusyChange?: (busy: boolean) => void; renderPortableText?: (field: ContentField, value: unknown, onChange: (value: unknown) => void) => ReactNode
  /** Ključevi iz missingForPublish: prikazuju se crvenim slovima. */
  missing?: Set<string>
}
export const REQUIRED_HINT = 'Obavezno za objavu'
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const months = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar']
export function validDate(text: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(text)) && new Date(text).toISOString().slice(0, 10) === text
}
// Nazivi polja za korisnicu: bez tehničkih izraza (slug, URL).
function fieldLabel(field: ContentField) {
  if (field.kind === 'slug') return 'Adresa na sajtu'
  return field.title.replace(/\s*\(adresa u URL-u\)/i, '').replace(/\bURL\b/, 'link')
}

function LineInput({ field, value, onChangeText, disabled, error, hint, multiline, keyboardType, autoCapitalize, prefix, missing }: {
  field: ContentField; value: string; onChangeText: (text: string) => void; disabled?: boolean; error?: string; hint?: string; multiline?: boolean; missing?: boolean;
  keyboardType?: 'default' | 'url' | 'email-address' | 'numbers-and-punctuation'; autoCapitalize?: 'none' | 'sentences'; prefix?: string
}) {
  const [focused, setFocused] = useState(false)
  return <View style={styles.line}>
    <Text style={[styles.label, missing && styles.error]}>{fieldLabel(field).toLocaleUpperCase('sr')}{field.required ? ' *' : ''}</Text>
    <View style={[styles.inputRow, focused && styles.inputFocused, (Boolean(error) || missing) && styles.inputError]}>
      {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
      <TextInput value={value} onChangeText={onChangeText} editable={!disabled} multiline={multiline} keyboardType={keyboardType} autoCapitalize={autoCapitalize} autoCorrect={keyboardType === 'default' || !keyboardType}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} accessibilityLabel={fieldLabel(field)} testID={`field-${field.name}`}
        placeholderTextColor={colors.inkFaint} placeholder={multiline ? 'Napišite ovde…' : undefined}
        style={[styles.input, multiline && styles.multiline]} />
    </View>
    {error || missing || hint ? <Text style={[styles.hint, (Boolean(error) || missing) && styles.error]}>{error || (missing ? REQUIRED_HINT : hint)}</Text> : null}
  </View>
}

// Kratka polja (godina, dimenzije, mesto) u jednom redu: naziv levo, vrednost desno.
function InlineInput({ field, value, onChangeText, disabled, error, keyboardType, missing }: { field: ContentField; value: string; onChangeText: (text: string) => void; disabled?: boolean; error?: string; keyboardType?: 'default' | 'numbers-and-punctuation' | 'email-address'; missing?: boolean }) {
  const [focused, setFocused] = useState(false)
  return <View>
    <View style={[styles.row, focused && styles.inputFocused, (Boolean(error) || missing) && styles.inputError]}>
      <Text style={[styles.rowLabel, missing && styles.error]}>{fieldLabel(field)}{field.required ? ' *' : ''}</Text>
      <TextInput value={value} onChangeText={onChangeText} editable={!disabled} keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} accessibilityLabel={fieldLabel(field)} testID={`field-${field.name}`}
        placeholder={missing ? 'Obavezno' : 'Dodajte'} placeholderTextColor={missing ? colors.error : colors.inkFaint} style={styles.inlineInput} />
    </View>
    {error || missing ? <Text style={[styles.hint, styles.error]}>{error || REQUIRED_HINT}</Text> : null}
  </View>
}

function DateRow({ field, value, onChange, disabled, missing }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean; missing?: boolean }) {
  const [open, setOpen] = useState(false)
  const text = typeof value === 'string' ? value : ''
  const valid = validDate(text)
  const label = valid ? (() => { const [y, m, d] = text.split('-').map(Number); return `${d}. ${months[m - 1]} ${y}.` })() : text || (missing ? 'Obavezno — izaberite datum' : 'Izaberite datum')
  return <View>
    <View style={[styles.row, missing && styles.inputError]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${field.title}: ${label}`} disabled={disabled} onPress={() => setOpen(true)} style={styles.rowPress} testID={`field-${field.name}-calendar`}>
        <Text style={[styles.rowLabel, missing && styles.error]}>{field.title}{field.required ? ' *' : ''}</Text>
        <Text style={[styles.rowValue, !valid && styles.placeholder, missing && styles.error]}>{label}</Text>
      </Pressable>
      {text && !field.required ? <Pressable accessibilityRole="button" accessibilityLabel={`Ukloni ${field.title}`} disabled={disabled} onPress={() => onChange(null)} hitSlop={8} style={styles.clear}><Icon name="close" size={18} color={colors.inkFaint} /></Pressable> : null}
    </View>
    {open ? <DateTimePicker value={valid ? new Date(`${text}T12:00:00`) : new Date()} mode="date" onChange={(event, date) => {
      setOpen(false)
      if (event.type === 'set' && date) onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)
    }} /> : null}
  </View>
}

function NumberInput({ field, value, onChange, disabled, missing }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean; missing?: boolean }) {
  const [raw, setRaw] = useState<string | null>(null)
  const display = raw !== null && (raw === String(value ?? '') || Number(raw.replace(',', '.')) === value) ? raw : String(value ?? '')
  const invalid = display !== '' && (!/^-?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(display) || !Number.isFinite(Number(display.replace(',', '.'))))
  return <InlineInput field={field} value={display} disabled={disabled} missing={missing} keyboardType="numbers-and-punctuation" error={invalid ? 'Unesite broj.' : undefined}
    onChangeText={text => { setRaw(text); const normalized = text.replace(',', '.'); onChange(text === '' ? null : /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized) && Number.isFinite(Number(normalized)) ? Number(normalized) : text) }} />
}

export function ContentFields({ fields, value, onChange, disabled, onBusyChange, renderPortableText, missing: missingKeys }: Props) {
  const busyFields = useRef(new Set<string>())
  const notifyBusy = useCallback((name: string, busy: boolean) => { if (busy) busyFields.current.add(name); else busyFields.current.delete(name); onBusyChange?.(busyFields.current.size > 0) }, [onBusyChange])
  return <View style={styles.form}>{fields.map(field => {
    const current = value[field.name]
    const change = (next: unknown) => onChange(field.name, next)
    const missing = Boolean(missingKeys?.has(field.name))
    let control: ReactNode
    switch (field.kind) {
      case 'info': control = <View style={styles.note}><Text style={styles.noteTitle}>Instagram i Facebook</Text><Text style={styles.hint}>Za automatske objave pređite na Instagram Creator ili Business nalog i povežite ga sa Facebook stranicom. Javite osobi koja održava sajt; tek kad potvrdi povezivanje izaberite „Povezano automatski“. Do tada sajt prikazuje ručno unete linkove.</Text></View>; break
      case 'date': control = <DateRow field={field} value={current} onChange={change} disabled={disabled} missing={missing} />; break
      case 'number': control = <NumberInput field={field} value={current} onChange={change} disabled={disabled} missing={missing} />; break
      case 'image': case 'images': control = <View style={styles.block}><Text style={[styles.label, missing && styles.error]}>{fieldLabel(field).toLocaleUpperCase('sr')}{field.required ? ' *' : ''}</Text><ImageField field={field} value={current} onChange={change} disabled={disabled} onBusyChange={busy => notifyBusy(field.name, busy)} missing={missingKeys} /></View>; break
      case 'reference': case 'references': control = <ReferenceField field={field} value={current} onChange={change} disabled={disabled} missing={missing} />; break
      case 'boolean': control = <View style={styles.row}>
        <Text style={[styles.rowLabel, styles.flex]}>{field.title}</Text>
        <Switch accessibilityLabel={field.title} accessibilityRole="switch" value={current === true} disabled={disabled} onValueChange={change} trackColor={{ false: colors.canvasDeep, true: colors.ink }} thumbColor={current === true ? colors.gold : colors.canvas} testID={`field-${field.name}`} />
      </View>; break
      case 'select': control = <View style={styles.block}>
        <Text style={[styles.label, missing && styles.error]}>{field.title.toLocaleUpperCase('sr')}{field.required ? ' *' : ''}{missing ? ` — ${REQUIRED_HINT.toLocaleUpperCase('sr')}` : ''}</Text>
        <View style={styles.chips}>{field.options?.map(option => <Chip key={option.value} label={option.title} selected={current === option.value} onPress={() => !disabled && change(current === option.value && !field.required ? null : option.value)} testID={`field-${field.name}-${option.value}`} />)}</View>
      </View>; break
      case 'portableText': control = <View style={styles.block}><Text style={styles.label}>{field.title.toLocaleUpperCase('sr')}</Text>{renderPortableText?.(field, current, change)}</View>; break
      case 'slug': control = <LineInput missing={missing} field={field} value={typeof object(current).current === 'string' ? String(object(current).current) : ''} disabled={disabled} autoCapitalize="none" keyboardType="url" prefix="zlaticart.com/…/" hint="Mala slova, brojevi i crtice." onChangeText={text => change({ ...object(current), _type: 'slug', current: text })} />; break
      case 'string': control = field.name === 'contactEmail' || field.name === 'siteTitle' ? <LineInput missing={missing} field={field} value={typeof current === 'string' ? current : ''} disabled={disabled} keyboardType={field.name === 'contactEmail' ? 'email-address' : 'default'} autoCapitalize={field.name === 'contactEmail' ? 'none' : 'sentences'} onChangeText={change} />
        : <InlineInput missing={missing} field={field} value={typeof current === 'string' ? current : ''} disabled={disabled} onChangeText={change} />; break
      default: control = <LineInput missing={missing} field={field} value={typeof current === 'string' ? current : ''} disabled={disabled} multiline={field.kind === 'text'}
        keyboardType={field.kind === 'url' ? 'url' : field.name === 'contactEmail' ? 'email-address' : 'default'}
        autoCapitalize={field.kind === 'url' || field.name === 'contactEmail' ? 'none' : 'sentences'}
        hint={field.kind === 'url' ? 'Ceo link, počinje sa https://' : undefined} onChangeText={change} />
    }
    return <View key={field.name}>{control}</View>
  })}</View>
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { gap: 18 },
  block: { gap: 10 },
  line: { gap: 2 },
  label: { ...textStyles.eyebrow, color: colors.inkFaint },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 1, borderColor: colors.canvasDeep },
  inputFocused: { borderColor: colors.ink }, inputError: { borderColor: colors.error },
  prefix: { ...textStyles.caption, color: colors.inkFaint, paddingBottom: 12 },
  input: { ...textStyles.body, color: colors.ink, flex: 1, minHeight: 46, paddingVertical: 8, paddingHorizontal: 0 },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  hint: { ...textStyles.caption, color: colors.inkFaint, paddingTop: 4 }, error: { color: colors.error },
  row: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: colors.canvasDeep },
  rowPress: { flex: 1, minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowLabel: { ...textStyles.body, fontSize: 15, color: colors.ink },
  rowValue: { ...textStyles.body, fontSize: 15, color: colors.ink },
  placeholder: { color: colors.inkFaint },
  inlineInput: { ...textStyles.body, fontSize: 15, color: colors.ink, flex: 1, textAlign: 'right', minHeight: 52, paddingVertical: 0 },
  clear: { width: 32, height: 44, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  note: { backgroundColor: colors.canvasWarm, borderRadius: 12, padding: 14, gap: 4 },
  noteTitle: { ...textStyles.label, color: colors.ink },
})
