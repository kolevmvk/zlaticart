import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { fetchContents, type ContentField, type ContentItem } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { Button, Feedback, Field } from '@/components/ui'
import { colors } from '@/theme/colors'
import { shape, spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'
import { newContentKey } from './ImageField'

export function ReferenceField({ field, value, onChange, disabled }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean }) {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const multiple = field.kind === 'references'
  const selected = (multiple ? (Array.isArray(value) ? value : []) : value ? [value] : []).filter(item => item && typeof item === 'object') as Record<string, unknown>[]
  useEffect(() => {
    if (!session || !field.referenceType) return
    let active = true
    fetchContents(session, field.referenceType).then(result => { if (active) setItems(result) }).catch(() => { if (active) setError('Lista nije učitana. Proverite vezu i pokušajte ponovo.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session, field.referenceType, attempt])
  function choose(item: ContentItem) {
    const reference = { _type: 'reference', _ref: item._id, ...(multiple ? { _key: newContentKey() } : {}) }
    onChange(multiple ? [...selected, reference] : reference)
    if (!multiple) setOpen(false)
  }
  function move(index: number, by: number) { const next = [...selected]; [next[index], next[index + by]] = [next[index + by], next[index]]; onChange(next) }
  return <View style={styles.group}>
    {selected.map((reference, index) => <View key={String(reference._key ?? reference._ref)} style={styles.selection}>
      <Text style={styles.text}>{items.find(item => item._id === reference._ref)?.title || `Izabrani dokument: ${String(reference._ref)}`}</Text>
      <Button label={`Ukloni izbor ${index + 1}`} variant="quiet" disabled={disabled} onPress={() => onChange(multiple ? selected.filter((_, i) => i !== index) : null)} testID={`field-${field.name}-remove-${index}`} />
      {multiple ? <><Button label={`Izbor ${index + 1}: pomeri gore`} variant="quiet" disabled={disabled || index === 0} onPress={() => move(index, -1)} testID={`field-${field.name}-up-${index}`} /><Button label={`Izbor ${index + 1}: pomeri dole`} variant="quiet" disabled={disabled || index === selected.length - 1} onPress={() => move(index, 1)} testID={`field-${field.name}-down-${index}`} /></> : null}
    </View>)}
    <Button label={open ? 'Zatvori izbor' : multiple ? 'Dodaj povezani dokument' : 'Izaberi dokument'} variant="secondary" disabled={disabled} onPress={() => setOpen(!open)} testID={`field-${field.name}-choose`} />
    {open ? <View style={styles.group}>
      <Field label="Pretraži dokumente" value={query} onChangeText={setQuery} editable={!disabled} testID={`field-${field.name}-search`} />
      {loading ? <Feedback title="Učitavanje dokumenata…" tone="loading" /> : error ? <Feedback title="Dokumenti nisu dostupni" message={error} tone="error" actionLabel="Pokušaj ponovo" onAction={() => { setLoading(true); setError(''); setAttempt(attempt + 1) }} /> : <>
        {items.filter(item => (item.title ?? '').toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(item => {
          const checked = selected.some(reference => reference._ref === item._id)
          return <Pressable key={item._id} accessibilityRole={multiple ? 'checkbox' : 'radio'} accessibilityLabel={item.title || 'Dokument bez naslova'} accessibilityState={{ checked, disabled: Boolean(disabled || checked) }} disabled={disabled || checked} onPress={() => choose(item)} testID={`field-${field.name}-option-${item._id}`} style={styles.option}><Text style={styles.text}>{checked ? '✓ ' : ''}{item.title || 'Dokument bez naslova'}{item.hasPublished ? '' : ' · Nacrt'}</Text></Pressable>
        })}
        {!items.some(item => (item.title ?? '').toLocaleLowerCase().includes(query.toLocaleLowerCase())) ? <Text style={styles.text}>{items.length ? 'Nema rezultata pretrage.' : 'Još nema dokumenata. Najpre ih dodajte u odgovarajućoj sekciji.'}</Text> : null}
      </>}
    </View> : null}
  </View>
}
const styles = StyleSheet.create({ group: { gap: spacing.sm }, selection: { padding: spacing.md, backgroundColor: colors.canvasWarm, gap: spacing.xs }, option: { minHeight: shape.touchTarget, padding: spacing.md, borderBottomWidth: 1, borderColor: colors.canvasDeep, justifyContent: 'center' }, text: { ...textStyles.body, color: colors.ink } })
