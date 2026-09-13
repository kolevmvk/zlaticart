import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { ContentField } from '@/api/content'
import { Banner, Icon, MenuSheet, PrimaryButton, Sheet } from '@/components/atelier'
import { blockText, editableBlock, markSelection, newBlock, removeLinks, replaceBlockText, textKey, type Block } from '@/lib/portable-text'
import { colors } from '@/theme/colors'
import { fonts, textStyles } from '@/theme/typography'
import { ImageField } from './ImageField'

// Pisanje kao na papiru (Atelje UI): pasusi bez okvira, traka ispod pasusa koji se uređuje.
const styleCycle = ['normal', 'h2', 'h3', 'blockquote'] as const
const styleNames: Record<string, string> = { normal: 'Pasus', h1: 'Naslov', h2: 'Naslov', h3: 'Podnaslov', h4: 'Podnaslov', h5: 'Podnaslov', h6: 'Podnaslov', blockquote: 'Citat' }

function Tool({ label, onPress, active, children, disabled, testID }: { label: string; onPress: () => void; active?: boolean; children: React.ReactNode; disabled?: boolean; testID?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: Boolean(active), disabled }} disabled={disabled} onPress={onPress} testID={testID}
    style={({ pressed }) => [styles.tool, active && styles.toolActive, pressed && styles.pressed]}>{children}</Pressable>
}

function BlockEditor({ block, onChange, onRemove, onMove, onAddImage, allowImages, disabled, focused, onFocus, index, count }: {
  block: Block; onChange: (block: Block) => void; onRemove: () => void; onMove: (by: number) => void; onAddImage: () => void; allowImages?: boolean
  disabled?: boolean; focused: boolean; onFocus: () => void; index: number; count: number
}) {
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const [linkOpen, setLinkOpen] = useState(false)
  const [more, setMore] = useState(false)
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const style = block.style ?? 'normal'
  const selectionMarks = new Set((block.children ?? []).flatMap(span => span.marks ?? []))
  const hasFormatting = (block.children ?? []).some(span => (span.marks ?? []).length > 0)
  function decorate(mark: string) {
    if (selection.start === selection.end) { setError('Označite reči dugim pritiskom, pa izaberite oznaku.'); return }
    setError(''); onChange(markSelection(block, selection.start, selection.end, mark))
  }
  function saveLink() {
    if (selection.start === selection.end) { setError('Označite tekst koji postaje link.'); setLinkOpen(false); return }
    if (!/^(https?:\/\/|mailto:|tel:|\/[^/]|#)/i.test(link.trim())) { setError('Link počinje sa https:// ili mailto:'); return }
    onChange(markSelection(removeLinks(block, selection.start, selection.end), selection.start, selection.end, textKey(), { _type: 'link', href: link.trim() }))
    setLinkOpen(false); setLink(''); setError('')
  }
  const inputStyle = [styles.paragraph, style.startsWith('h') && (style === 'h1' || style === 'h2' ? styles.h2 : styles.h3), style === 'blockquote' && styles.quote]
  return <View style={[styles.block, focused && styles.blockFocused]}>
    <View style={styles.blockRow}>
      {block.listItem ? <Text style={styles.bullet}>{block.listItem === 'number' ? `${index + 1}.` : '•'}</Text> : null}
      <TextInput multiline value={blockText(block)} editable={!disabled} onFocus={onFocus} placeholder={index === 0 ? 'Počnite da pišete…' : 'Nastavite…'} placeholderTextColor={colors.inkFaint}
        onChangeText={text => onChange(replaceBlockText(block, text))} onSelectionChange={event => setSelection(event.nativeEvent.selection)}
        style={inputStyle} testID={`rich-text-${block._key}`} accessibilityLabel={`${styleNames[style] ?? 'Pasus'} ${index + 1}`} />
    </View>
    {hasFormatting ? <Text style={styles.preview} accessibilityLabel="Prikaz formatiranja">
      {(block.children ?? []).map(span => {
        const marks = span.marks ?? []
        const linked = marks.some(mark => (block.markDefs ?? []).some(def => def._key === mark && def._type === 'link'))
        return <Text key={span._key} style={[marks.includes('strong') && styles.bold, marks.includes('em') && styles.italic, (marks.includes('underline') || linked) && styles.underline, marks.includes('strike-through') && styles.strike]}>{span.text}</Text>
      })}
    </Text> : null}
    {focused ? <View style={styles.toolbar} accessibilityRole="toolbar">
      <Tool label={`Stil: ${styleNames[style] ?? 'Pasus'}`} disabled={disabled} onPress={() => onChange({ ...block, style: styleCycle[(styleCycle.indexOf(style as typeof styleCycle[number]) + 1) % styleCycle.length] })} testID="rich-style"><Text style={styles.toolSerif}>Aa</Text></Tool>
      <Tool label="Podebljano" active={selectionMarks.has('strong')} disabled={disabled} onPress={() => decorate('strong')} testID="rich-strong"><Text style={styles.toolBold}>B</Text></Tool>
      <Tool label="Kurziv" active={selectionMarks.has('em')} disabled={disabled} onPress={() => decorate('em')} testID="rich-em"><Text style={styles.toolItalic}>I</Text></Tool>
      <Tool label="Lista" active={Boolean(block.listItem)} disabled={disabled} onPress={() => onChange({ ...block, listItem: block.listItem === 'bullet' ? 'number' : block.listItem === 'number' ? null : 'bullet', level: block.listItem === 'number' ? null : 1 })} testID="rich-list"><Icon name="list" size={20} /></Tool>
      <Tool label="Link" disabled={disabled} onPress={() => setLinkOpen(true)} testID="rich-link"><Icon name="link" size={20} /></Tool>
      {allowImages ? <Tool label="Dodaj fotografiju posle ovog pasusa" disabled={disabled} onPress={onAddImage} testID="rich-image"><Icon name="image" size={20} /></Tool> : null}
      <Tool label="Još" disabled={disabled} onPress={() => setMore(true)} testID="rich-more"><Icon name="more" size={20} /></Tool>
    </View> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Sheet visible={linkOpen} onClose={() => setLinkOpen(false)}>
      <Text style={styles.sheetTitle}>Link u tekstu</Text>
      <Text style={styles.muted}>{selection.start === selection.end ? 'Najpre označite reči u pasusu.' : `„${blockText(block).slice(selection.start, selection.end)}“`}</Text>
      <TextInput value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" placeholder="https://" placeholderTextColor={colors.inkFaint} style={styles.linkInput} />
      <PrimaryButton label="Sačuvaj link" onPress={saveLink} />
      <PrimaryButton tone="outline" label="Ukloni link sa označenog teksta" onPress={() => { onChange(removeLinks(block, selection.start, selection.end)); setLinkOpen(false) }} />
    </Sheet>
    <MenuSheet visible={more} onClose={() => setMore(false)} title={styleNames[style] ?? 'Pasus'} items={[
      { label: 'Podvučeno', onPress: () => decorate('underline') },
      { label: 'Precrtano', onPress: () => decorate('strike-through') },
      { label: 'Pomeri gore', icon: 'left', disabled: index === 0, onPress: () => onMove(-1) },
      { label: 'Pomeri dole', icon: 'right', disabled: index === count - 1, onPress: () => onMove(1) },
      { label: 'Ukloni pasus', icon: 'trash', destructive: true, onPress: onRemove },
    ]} />
  </View>
}

export function PortableTextEditor({ field, value, onChange, disabled, onBusyChange }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean; onBusyChange: (busy: boolean) => void }) {
  const blocks = (Array.isArray(value) ? value : []) as Block[]
  const [focusedKey, setFocusedKey] = useState<string | null>(null)
  const update = (index: number, block: Block) => onChange(blocks.map((old, i) => i === index ? block : old))
  const move = (index: number, by: number) => { const next = [...blocks]; [next[index], next[index + by]] = [next[index + by], next[index]]; onChange(next) }
  const insertAfter = (index: number, block: Block) => onChange([...blocks.slice(0, index + 1), block, ...blocks.slice(index + 1)])
  return <View style={styles.editor}>
    {!blocks.length ? <Pressable accessibilityRole="button" disabled={disabled} onPress={() => { const block = newBlock(); onChange([block]); setFocusedKey(block._key) }} style={styles.startWriting} testID={`field-${field.name}-paragraph`}>
      <Text style={styles.placeholderWriting}>Počnite da pišete…</Text>
    </Pressable> : null}
    {blocks.map((block, index) => <View key={block._key}>
      {block._type === 'image' && field.allowImages ? <View style={styles.imageBlock}>
        <ImageField field={{ ...field, kind: 'image', title: 'Fotografija u tekstu' }} value={block} disabled={disabled} onBusyChange={onBusyChange}
          onChange={next => { if (next) update(index, { ...(next as Block), _key: block._key }); else onChange(blocks.filter((_, i) => i !== index)) }} />
      </View> : editableBlock(block) ? <BlockEditor block={block} index={index} count={blocks.length} allowImages={field.allowImages} disabled={disabled}
        focused={focusedKey === block._key} onFocus={() => setFocusedKey(block._key)} onChange={next => update(index, next)}
        onRemove={() => onChange(blocks.filter((_, i) => i !== index))} onMove={by => move(index, by)}
        onAddImage={() => insertAfter(index, { _type: 'image', _key: textKey() })} />
        : <Banner title="Poseban blok je sačuvan" message="Ovaj format se uređuje u web panelu; ovde ostaje netaknut." />}
    </View>)}
    {blocks.length ? <Pressable accessibilityRole="button" disabled={disabled} onPress={() => { const block = newBlock(); onChange([...blocks, block]); setFocusedKey(block._key) }} style={styles.addParagraph} testID={`field-${field.name}-paragraph`}>
      <Icon name="plus" size={18} color={colors.inkMuted} /><Text style={styles.muted}>Nov pasus</Text>
    </Pressable> : null}
  </View>
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  editor: { gap: 6 },
  block: { paddingVertical: 2, gap: 6 },
  blockFocused: { paddingBottom: 6 },
  blockRow: { flexDirection: 'row', gap: 8 },
  bullet: { ...textStyles.writing, color: colors.inkMuted, paddingTop: 8 },
  paragraph: { ...textStyles.writing, color: colors.ink, flex: 1, paddingVertical: 6, paddingHorizontal: 0, textAlignVertical: 'top' },
  h2: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34 },
  h3: { fontFamily: fonts.serifMedium, fontSize: 23, lineHeight: 30 },
  quote: { fontFamily: fonts.serifItalic, borderLeftWidth: 2, borderColor: colors.gold, paddingLeft: 14 },
  preview: { ...textStyles.caption, fontSize: 14, color: colors.inkMuted },
  bold: { fontFamily: fonts.sansBold }, italic: { fontStyle: 'italic' }, underline: { textDecorationLine: 'underline' }, strike: { textDecorationLine: 'line-through' },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.canvasWarm, borderRadius: 12, paddingHorizontal: 4 },
  tool: { minWidth: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toolActive: { backgroundColor: colors.canvasDeep },
  toolSerif: { fontFamily: fonts.serif, fontSize: 19, color: colors.ink },
  toolBold: { fontFamily: fonts.sansBold, fontSize: 17, color: colors.ink },
  toolItalic: { fontFamily: fonts.serifItalic, fontSize: 20, color: colors.ink },
  error: { ...textStyles.caption, color: colors.error },
  muted: { ...textStyles.caption, color: colors.inkMuted },
  sheetTitle: { ...textStyles.title, color: colors.ink },
  linkInput: { ...textStyles.body, color: colors.ink, minHeight: 48, borderBottomWidth: 1, borderColor: colors.ink },
  imageBlock: { paddingVertical: 8 },
  startWriting: { minHeight: 64, justifyContent: 'center', borderBottomWidth: 1, borderColor: colors.canvasDeep },
  placeholderWriting: { ...textStyles.writing, color: colors.inkFaint },
  addParagraph: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
})
