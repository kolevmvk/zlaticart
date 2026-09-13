import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { contentCover, fetchContents, fetchContentTypes, type ContentField, type ContentItem } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { Artwork, Banner, Icon, PrimaryButton, Sheet } from '@/components/atelier'
import { colors } from '@/theme/colors'
import { textStyles } from '@/theme/typography'
import { newContentKey } from './ImageField'

type Reference = Record<string, unknown>

/** Veza ka drugom sadržaju: jedan izbor kao red „Tehnika › Ulje“, više izbora kao čipovi. */
export function ReferenceField({ field, value, onChange, disabled, missing }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean; missing?: boolean }) {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const multiple = field.kind === 'references'
  const selected = (multiple ? (Array.isArray(value) ? value : []) : value ? [value] : []).filter(item => item && typeof item === 'object') as Reference[]
  const schema = useQuery({ queryKey: ['content-types'], queryFn: () => fetchContentTypes(session!), enabled: Boolean(session) })
  const items = useQuery({ queryKey: ['contents', field.referenceType], queryFn: () => fetchContents(session!, field.referenceType!), enabled: Boolean(session && field.referenceType) })
  const target = schema.data?.find(type => type.name === field.referenceType)
  const titleOf = (ref: Reference) => items.data?.find(item => item._id === ref._ref)?.title || (items.isPending ? 'Učitavanje…' : 'Nedostupan sadržaj')

  function toggle(item: ContentItem) {
    const chosen = selected.some(ref => ref._ref === item._id)
    if (!multiple) { onChange(chosen ? null : { _type: 'reference', _ref: item._id }); setOpen(false); return }
    onChange(chosen ? selected.filter(ref => ref._ref !== item._id) : [...selected, { _type: 'reference', _ref: item._id, _key: newContentKey() }])
  }
  const needle = search.trim().toLocaleLowerCase('sr')
  const options = (items.data ?? []).filter(item => (item.title ?? '').toLocaleLowerCase('sr').includes(needle))

  return <View>
    {multiple ? <View style={styles.block}>
      <Text style={[styles.label, missing && styles.error]}>{field.title.toLocaleUpperCase('sr')}{missing ? ' — OBAVEZNO ZA OBJAVU' : ''}</Text>
      <View style={styles.chips}>
        {selected.map((ref, index) => <Pressable key={String(ref._key ?? ref._ref)} accessibilityRole="button" accessibilityLabel={`Ukloni ${titleOf(ref)}`} disabled={disabled} onPress={() => onChange(selected.filter((_, i) => i !== index))} style={styles.chip} testID={`field-${field.name}-remove-${index}`}>
          <Text style={styles.chipText} numberOfLines={1}>{titleOf(ref)}</Text><Icon name="close" size={16} color={colors.inkMuted} />
        </Pressable>)}
        <Pressable accessibilityRole="button" disabled={disabled} onPress={() => setOpen(true)} style={[styles.chip, styles.addChip]} testID={`field-${field.name}-choose`}>
          <Icon name="plus" size={16} /><Text style={styles.chipText}>Dodaj</Text>
        </Pressable>
      </View>
    </View> : <Pressable accessibilityRole="button" accessibilityLabel={`${field.title}: ${selected[0] ? titleOf(selected[0]) : 'nije izabrano'}`} disabled={disabled} onPress={() => setOpen(true)} style={styles.row} testID={`field-${field.name}-choose`}>
      <Text style={[styles.rowLabel, missing && styles.error]}>{field.title}{field.required ? ' *' : ''}</Text>
      <View style={styles.rowValue}><Text style={[styles.value, !selected[0] && styles.placeholder, missing && styles.error]} numberOfLines={1}>{selected[0] ? titleOf(selected[0]) : missing ? 'Obavezno — izaberite' : 'Izaberite'}</Text><Icon name="chevron" size={18} color={colors.inkFaint} /></View>
    </Pressable>}

    <Sheet visible={open} onClose={() => setOpen(false)}>
      <Text style={styles.sheetTitle}>{field.title}</Text>
      <TextInput value={search} onChangeText={setSearch} placeholder="Pretraži" placeholderTextColor={colors.inkFaint} style={styles.search} testID={`field-${field.name}-search`} />
      {items.isError ? <Banner title="Lista nije učitana" message="Proverite vezu." action="Pokušaj ponovo" onAction={() => void items.refetch()} /> : null}
      {items.data && !options.length ? <Text style={styles.muted}>{items.data.length ? 'Nema rezultata.' : `Još nema unosa u sekciji „${target?.title ?? 'sadržaj'}“.`}</Text> : null}
      {options.map(item => {
        const chosen = selected.some(ref => ref._ref === item._id)
        const cover = contentCover(target, item.document, 200)
        return <Pressable key={item._id} accessibilityRole={multiple ? 'checkbox' : 'radio'} accessibilityState={{ checked: chosen }} onPress={() => toggle(item)} style={styles.option} testID={`field-${field.name}-option-${item._id}`}>
          {cover ? <Artwork uri={cover} style={styles.optionThumb} /> : null}
          <View style={styles.flex}>
            <Text style={styles.value} numberOfLines={1}>{item.title || 'Bez naslova'}</Text>
            {!item.hasPublished ? <Text style={styles.muted}>Nacrt — mora biti objavljen pre objave ovog unosa</Text> : null}
          </View>
          {chosen ? <Icon name="check" /> : null}
        </Pressable>
      })}
      {!multiple && selected[0] && !field.required ? <PrimaryButton tone="outline" label="Ukloni izbor" onPress={() => { onChange(null); setOpen(false) }} /> : null}
      {multiple ? <PrimaryButton label="Gotovo" onPress={() => setOpen(false)} /> : null}
    </Sheet>
  </View>
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  block: { gap: 10 },
  label: { ...textStyles.eyebrow, color: colors.inkFaint },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, maxWidth: '100%', paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.canvasWarm },
  addChip: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.canvasDeep },
  chipText: { ...textStyles.caption, fontSize: 14, color: colors.ink, flexShrink: 1 },
  row: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottomWidth: 1, borderColor: colors.canvasDeep },
  rowLabel: { ...textStyles.body, fontSize: 15, color: colors.ink },
  rowValue: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  value: { ...textStyles.body, fontSize: 15, color: colors.ink, flexShrink: 1 },
  placeholder: { color: colors.inkFaint },
  error: { color: colors.error },
  sheetTitle: { ...textStyles.title, color: colors.ink },
  search: { ...textStyles.body, color: colors.ink, minHeight: 48, borderBottomWidth: 1, borderColor: colors.ink },
  muted: { ...textStyles.caption, color: colors.inkMuted },
  option: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: colors.canvasDeep, paddingVertical: 6 },
  optionThumb: { width: 48, height: 48, borderRadius: 8 },
})
