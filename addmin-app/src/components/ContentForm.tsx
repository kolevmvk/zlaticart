import { useEffect, useRef, useState } from 'react'
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { AdminApiError, updateArtworkStatus } from '@/api/admin'
import { contentCover, createContent, fetchContent, getContentPreviewUrl, newContentId, publishContent, removeContent, saveContent, type ContentField, type ContentItem, type ContentType } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { Banner, edge, Eyebrow, Icon, IconButton, MenuSheet, PrimaryButton, Sheet, StatusLine, Toast, TopBar, useToast, type MenuItem } from '@/components/atelier'
import { DeleteSheet, type DeleteTarget } from '@/components/atelier/DeleteSheet'
import { HeroImage } from '@/components/content/ImageField'
import { PortableTextEditor } from '@/components/content/PortableTextEditor'
import { ContentFields } from '@/components/ContentFields'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { colors } from '@/theme/colors'
import { textStyles } from '@/theme/typography'

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
function knownValues(type: ContentType, document: Record<string, unknown>) {
  return Object.fromEntries(type.fields.filter(field => field.kind !== 'info' && document[field.name] !== undefined).map(field => [field.name, document[field.name]]))
}

// Grupe polja (Atelje UI): osnovno, tekst, fotografije, povezano, na sajtu, detalji.
type GroupKey = 'basic' | 'text' | 'images' | 'links' | 'site' | 'details'
const groupTitles: Record<GroupKey, string> = { basic: 'Osnovno', text: 'Tekst', images: 'Fotografije', links: 'Povezano', site: 'Na sajtu', details: 'Detalji' }
function groupOf(field: ContentField): GroupKey {
  if (field.kind === 'portableText' || field.kind === 'text') return 'text'
  if (field.kind === 'image' || field.kind === 'images') return 'images'
  if (field.kind === 'references') return 'links'
  if (field.kind === 'boolean' || /order/i.test(field.name)) return 'site'
  if (field.kind === 'slug' || field.kind === 'url' || field.kind === 'info' || field.name === 'motionLanguage') return 'details'
  return 'basic'
}
type Confirm = 'publish' | 'discard' | 'archive' | 'hide' | 'reload'
const confirmCopy: Record<Confirm, [string, string, string]> = {
  publish: ['Objaviti na sajtu?', 'Posetioci će videti ovu verziju.', 'Objavi'],
  discard: ['Odbaciti izmene?', 'Neobjavljene izmene se brišu. Verzija koja je na sajtu ostaje.', 'Odbaci izmene'],
  archive: ['Arhivirati rad?', 'Rad nestaje sa sajta i ostaje u arhivi. Sačuvane izmene ostaju.', 'Arhiviraj'],
  hide: ['Skloniti sa sajta?', 'Posetioci ga više ne vide. Uvek ga možete ponovo objaviti.', 'Skloni sa sajta'],
  reload: ['Učitati sačuvanu verziju?', 'Nesačuvane izmene u formi se odbacuju.', 'Učitaj'],
}

export function ContentForm({ type, initial }: { type: ContentType; initial?: ContentItem }) {
  const { session, expired } = useAuth()
  const router = useRouter()
  const cache = useQueryClient()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const [clientId] = useState(() => type.singleton ?? newContentId(type.name))
  const [version, setVersion] = useState(initial)
  const [values, setValues] = useState<Record<string, unknown>>(() => initial?.document ?? Object.fromEntries(type.fields.filter(f => f.initialValue !== undefined).map(f => [f.name, f.initialValue])))
  const [baseline, setBaseline] = useState(values)
  const [working, setWorking] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const busyRef = useRef(false)
  const uploadRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [needsReload, setNeedsReload] = useState(false)
  const [menu, setMenu] = useState(false)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(Boolean(type.singleton))
  const [keyboard, setKeyboard] = useState(false)
  const dirty = !same(knownValues(type, values), knownValues(type, baseline))
  const busy = Boolean(working) || uploading || expired
  const allowLeave = useUnsavedChanges(dirty, Boolean(working) || uploading)

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true))
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false))
    return () => { show.remove(); hide.remove() }
  }, [])

  function changedFields() {
    const known = knownValues(type, values)
    return Object.fromEntries(Object.entries(known).filter(([key, value]) => !same(value, baseline[key])))
  }
  function accept(item: ContentItem) {
    setVersion(item); setValues(item.document); setBaseline(item.document)
    cache.setQueryData(['content', type.name, item._id], item)
    void cache.invalidateQueries({ queryKey: ['contents'] })
    void cache.invalidateQueries({ queryKey: ['admin-artworks'] })
  }
  async function persist() {
    if (!session) throw new Error('Prijavite se ponovo.')
    if (!version) {
      const created = await createContent(session, type.name, clientId, knownValues(type, values))
      // Ponovljen zahtev može naći dokument koji je napravio raniji pokušaj ili drugi uređaj.
      // Unos ostaje u formi; različite vrednosti traže izričito drugo čuvanje.
      if (created.existed && Object.entries(knownValues(type, values)).some(([key, value]) => !same(value, created.document[key]))) {
        setVersion(created); setBaseline(created.document)
        throw new Error('Ovaj unos već postoji. Vaš tekst je i dalje u formi — proverite ga i sačuvajte ponovo.')
      }
      accept(created)
      return created
    }
    if (!dirty) return version
    const saved = await saveContent(session, type.name, version._id, changedFields(), version.revision)
    accept(saved)
    return saved
  }
  async function run(action: 'draft' | 'publish' | 'preview' | 'discard' | 'archive' | 'hide' | 'reload') {
    if (!session || busyRef.current || uploadRef.current || expired) return
    busyRef.current = true; setWorking(action); setError(null)
    let savedBeforeFailure = false
    try {
      if (action === 'reload') {
        if (!version) return
        accept(await fetchContent(session, type.name, version._id)); setNeedsReload(false)
        toast.show('Učitana je poslednja sačuvana verzija.')
        return
      }
      if (action === 'discard') {
        if (!version) return
        const result = await removeContent(session, type.name, version._id, version.revision, true)
        void cache.invalidateQueries({ queryKey: ['contents'] })
        if (result.deleted) { allowLeave(); router.back() }
        else { accept(await fetchContent(session, type.name, version._id)); toast.show('Izmene su odbačene.') }
        return
      }
      if (action === 'archive' || action === 'hide') {
        if (!version) return
        // Menja samo javnu vidljivost rada; sačuvan nacrt ostaje.
        await updateArtworkStatus(session, version._id, action === 'archive' ? 'archived' : 'draft')
        accept(await fetchContent(session, type.name, version._id))
        toast.show(action === 'archive' ? 'Rad je arhiviran.' : 'Rad je sklonjen sa sajta.')
        return
      }
      const saved = await persist()
      savedBeforeFailure = true
      if (action === 'draft') { toast.show('Nacrt sačuvan. Sajt se menja tek objavom.'); return }
      if (action === 'publish') {
        const published = await publishContent(session, type.name, saved._id, saved.revision)
        accept(published); toast.show('Objavljeno na sajtu.'); return
      }
      const slug = saved.document.slug as { current?: string } | undefined
      if (!slug?.current) throw new Error('Za pregled je potrebna adresa na sajtu (u delu Detalji).')
      const url = await getContentPreviewUrl(session, type.name as 'artwork' | 'journalPost', slug.current)
      await WebBrowser.openBrowserAsync(url)
    } catch (e) {
      setError(`${savedBeforeFailure ? 'Nacrt je sačuvan. ' : ''}${e instanceof Error ? e.message : 'Radnja nije završena. Proverite vezu i pokušajte ponovo.'}`)
      if (e instanceof AdminApiError && (e.status === 409 || e.kind === 'network' || e.kind === 'timeout')) setNeedsReload(true)
    } finally { busyRef.current = false; setWorking(null) }
  }

  const heroField = type.fields.find(field => field.name === type.imageField && field.kind === 'image')
  const titleField = type.fields.find(field => field.name === type.titleField && (field.kind === 'string' || field.kind === 'text'))
  // Vidljivost rada menja se objavom i menijem, ne poljem u formi.
  const skip = new Set([heroField?.name, titleField?.name, type.name === 'artwork' ? 'status' : undefined])
  const groups = (Object.keys(groupTitles) as GroupKey[]).map(key => ({ key, fields: type.fields.filter(field => !skip.has(field.name) && groupOf(field) === key) })).filter(group => group.fields.length)
  const previewable = type.name === 'artwork' || type.name === 'journalPost'
  const artworkOffSite = type.name === 'artwork' && Boolean(version?.hasPublished) && !version?.hasDraft && version?.document.status !== 'published'
  const canPublish = !busy && (!version || dirty || Boolean(version.hasDraft) || artworkOffSite)
  const title = titleField ? String(values[titleField.name] ?? '') : ''

  function change(name: string, value: unknown) {
    setValues(previous => {
      const next = { ...previous, [name]: value }
      if (!version && name === type.titleField && type.fields.some(field => field.kind === 'slug')) {
        const oldSlug = (previous.slug as { current?: string } | undefined)?.current
        const slugify = (text: unknown) => String(text ?? '').toLowerCase().replace(/đ/g, 'dj').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        if (!oldSlug || oldSlug === slugify(previous[name])) next.slug = { _type: 'slug', current: slugify(value) }
      }
      return next
    })
  }
  const setBusy = (value: boolean) => { uploadRef.current = value; setUploading(value) }

  const menuItems: MenuItem[] = [
    { label: 'Sačuvaj nacrt', icon: 'check', disabled: busy, onPress: () => void run('draft'), testID: 'content-menu-save' },
    ...(previewable ? [{ label: 'Pregledaj na sajtu', icon: 'eye' as const, disabled: busy, hint: 'Prvo sačuva nacrt.', onPress: () => void run('preview') }] : []),
    ...(version?.hasDraft && version.hasPublished ? [{ label: 'Odbaci neobjavljene izmene', icon: 'close' as const, disabled: busy, onPress: () => setConfirm('discard'), testID: 'content-discard' }] : []),
    ...(type.name === 'artwork' && version?.hasPublished && !artworkOffSite ? [
      { label: 'Skloni sa sajta', icon: 'eye' as const, disabled: busy || dirty, hint: dirty ? 'Najpre sačuvajte izmene.' : undefined, onPress: () => setConfirm('hide'), testID: 'content-hide' },
      { label: 'Arhiviraj', icon: 'image' as const, disabled: busy || dirty, onPress: () => setConfirm('archive'), testID: 'content-archive' },
    ] : []),
    ...(needsReload && version ? [{ label: 'Učitaj sačuvanu verziju', icon: 'back' as const, disabled: busy, onPress: () => setConfirm('reload') }] : []),
    ...(version ? [{ label: 'Obriši', icon: 'trash' as const, destructive: true, disabled: busy, testID: 'content-delete',
      onPress: () => setDeleting({ type: type.name, id: version._id, revision: version.revision, title, imageUri: contentCover(type, version.document, 200), hasPublished: version.hasPublished }) }] : []),
  ]

  const moreButton = <IconButton icon="more" label="Još radnji" onImage={Boolean(heroField)} onPress={() => setMenu(true)} testID="content-menu" />
  const barVisible = !keyboard
  return <View style={styles.screen}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}>
      {heroField ? <View>
        <HeroImage field={heroField} value={values[heroField.name]} onChange={value => change(heroField.name, value)} disabled={busy} onBusyChange={setBusy} />
        <View style={[styles.heroBar, { top: insets.top + 8 }]}><TopBar onImage right={moreButton} /></View>
      </View> : <View style={{ paddingTop: insets.top }}><TopBar right={moreButton} title={type.title} /></View>}

      <View style={styles.body}>
        {error ? <Banner title="Nije završeno" message={error} action={needsReload && version ? 'Učitaj sačuvanu verziju' : undefined} onAction={() => setConfirm('reload')} /> : null}
        {titleField ? <View style={styles.titleBlock}>
          <Eyebrow>{(heroField ? type.title : titleField.title).toLocaleUpperCase('sr')}</Eyebrow>
          <TextInput value={title} onChangeText={text => change(titleField.name, text)} editable={!busy} multiline={titleField.kind === 'text'}
            placeholder={titleField.kind === 'text' ? 'Kratak opis objave' : 'Naziv'} placeholderTextColor={colors.inkFaint}
            style={[styles.title, titleField.kind === 'text' && styles.titleText]} accessibilityLabel={titleField.title} testID={`field-${titleField.name}`} />
        </View> : null}

        {groups.map(group => {
          const collapsible = group.key === 'details' && !type.singleton
          const open = !collapsible || detailsOpen
          return <View key={group.key} style={styles.group}>
            {collapsible ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setDetailsOpen(!open)} style={styles.groupToggle} testID="content-details">
              <Eyebrow>{groupTitles[group.key].toLocaleUpperCase('sr')}</Eyebrow><Icon name={open ? 'close' : 'plus'} size={18} color={colors.inkFaint} />
            </Pressable> : <Eyebrow style={styles.groupTitle}>{groupTitles[group.key].toLocaleUpperCase('sr')}</Eyebrow>}
            {open ? <ContentFields fields={group.fields} value={values} onChange={change} disabled={busy} onBusyChange={setBusy}
              renderPortableText={(field, value, onChange) => <PortableTextEditor field={field} value={value} onChange={onChange} disabled={busy} onBusyChange={setBusy} />} /> : null}
          </View>
        })}
      </View>
    </ScrollView>

    {barVisible ? <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.barStatus}>
        {version ? <StatusLine status={version.publicationStatus} hasPublished={version.hasPublished} hidden={artworkOffSite} /> : <Text style={styles.barText}>Novi unos</Text>}
        <Text style={styles.barHint} numberOfLines={1}>{uploading ? 'Slanje fotografije…' : working ? 'Sačekajte…' : dirty ? 'Nesačuvane izmene' : version ? 'Sve je sačuvano' : 'Još nije sačuvano'}</Text>
      </View>
      {dirty || !version ? <PrimaryButton tone="outline" label="Sačuvaj" disabled={busy} loading={working === 'draft'} onPress={() => void run('draft')} testID="content-save-draft" style={styles.barButton} /> : null}
      {previewable ? <Pressable accessibilityRole="button" accessibilityLabel="Pregledaj na sajtu" disabled={busy} onPress={() => void run('preview')} style={[styles.eye, busy && styles.disabled]} testID="content-preview"><Icon name="eye" /></Pressable> : null}
      <PrimaryButton label={canPublish ? 'Objavi' : 'Na sajtu'} disabled={!canPublish} loading={working === 'publish'} onPress={() => setConfirm('publish')} testID="content-publish" style={styles.barButton} />
    </View> : null}

    <MenuSheet visible={menu} onClose={() => setMenu(false)} title={title || type.title} items={menuItems} />
    <Sheet visible={confirm !== null} onClose={() => setConfirm(null)}>
      {confirm ? <>
        <Text style={styles.sheetTitle}>{confirmCopy[confirm][0]}</Text>
        <Text style={styles.sheetText}>{confirmCopy[confirm][1]}</Text>
        <PrimaryButton label={confirmCopy[confirm][2]} tone={confirm === 'publish' || confirm === 'reload' ? 'ink' : 'danger'} onPress={() => { const action = confirm; setConfirm(null); void run(action) }} testID="confirm-action" />
        <PrimaryButton tone="outline" label="Odustani" onPress={() => setConfirm(null)} style={styles.plain} />
      </> : null}
    </Sheet>
    <DeleteSheet target={deleting} onClose={() => setDeleting(null)}
      onDeleted={() => { setDeleting(null); void cache.invalidateQueries({ queryKey: ['contents'] }); allowLeave(); router.back() }}
      onHidden={() => { setDeleting(null); if (session && version) void fetchContent(session, type.name, version._id).then(accept); toast.show('Rad je sklonjen sa sajta.') }} />
    <Toast message={toast.message} bottom={insets.bottom + 96} />
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  heroBar: { position: 'absolute', left: 0, right: 0 },
  body: { paddingHorizontal: edge, paddingTop: 18, gap: 30 },
  titleBlock: { gap: 2, borderBottomWidth: 1, borderColor: colors.ink, paddingBottom: 4 },
  title: { ...textStyles.heading, fontSize: 34, lineHeight: 40, color: colors.ink, paddingVertical: 4, paddingHorizontal: 0 },
  titleText: { fontSize: 24, lineHeight: 31, minHeight: 64, textAlignVertical: 'top' },
  group: { gap: 8 },
  groupTitle: { marginBottom: 2 },
  groupToggle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: edge, paddingTop: 12, backgroundColor: colors.canvas, borderTopWidth: 1, borderColor: colors.canvasDeep },
  barStatus: { flex: 1, gap: 2 },
  barText: { ...textStyles.caption, color: colors.ink },
  barHint: { ...textStyles.caption, fontSize: 12, color: colors.inkFaint },
  barButton: { paddingHorizontal: 16 },
  eye: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.canvasDeep, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
  sheetTitle: { ...textStyles.title, color: colors.ink },
  sheetText: { ...textStyles.body, fontSize: 15, color: colors.inkMuted },
  plain: { borderWidth: 0 },
})
