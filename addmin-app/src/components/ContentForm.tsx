import { useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { AdminApiError, getArtworkPreviewUrl, updateArtworkStatus } from '@/api/admin'
import { createContent, fetchContent, newContentId, publishContent, removeContent, saveContent, type ContentItem, type ContentType } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { ContentFields } from '@/components/ContentFields'
import { Button, Feedback, Screen } from '@/components/ui'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'
const versionLabels = { draft: 'Sačuvan nacrt', changed: 'Neobjavljene izmene', published: 'Objavljena verzija' }
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
function knownValues(type: ContentType, document: Record<string, unknown>) {
  return Object.fromEntries(type.fields.filter(field => field.kind !== 'info' && document[field.name] !== undefined).map(field => [field.name, document[field.name]]))
}
export function ContentForm({ type, initial }: { type: ContentType; initial?: ContentItem }) {
  const { session, expired } = useAuth()
  const router = useRouter()
  const cache = useQueryClient()
  const [clientId] = useState(() => type.singleton ?? newContentId(type.name))
  const [version, setVersion] = useState(initial)
  const [values, setValues] = useState<Record<string, unknown>>(() => initial?.document ?? Object.fromEntries(type.fields.filter(f => f.initialValue !== undefined).map(f => [f.name, f.initialValue])))
  const [baseline, setBaseline] = useState(values)
  const [working, setWorking] = useState(false)
  const [uploading, setUploading] = useState(false)
  const busyRef = useRef(false)
  const uploadRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [needsReload, setNeedsReload] = useState(false)
  const dirty = !same(knownValues(type, values), knownValues(type, baseline))
  const busy = working || uploading || expired
  const allowLeave = useUnsavedChanges(dirty, working || uploading)
  function changedFields() {
    const known = knownValues(type, values)
    return Object.fromEntries(Object.entries(known).filter(([key, value]) => !same(value, baseline[key])))
  }
  function accept(item: ContentItem) {
    setVersion(item); setValues(item.document); setBaseline(item.document)
    cache.setQueryData(['content', type.name, item._id], item)
    void cache.invalidateQueries({ queryKey: ['contents', type.name] })
    void cache.invalidateQueries({ queryKey: ['admin-artworks'] })
  }
  async function persist() {
    if (!session) throw new Error('Prijavite se ponovo.')
    if (!version) {
      const created = await createContent(session, type.name, clientId, knownValues(type, values))
      // A retry may find a document created by an earlier request or another editor.
      // Preserve the phone input and require an explicit second save for different values.
      if (created.existed && Object.entries(knownValues(type, values)).some(([key, value]) => !same(value, created.document[key]))) {
        setVersion(created); setBaseline(created.document)
        throw new Error('Dokument već postoji. Vaš unos je sačuvan u formi. Proverite ga i ponovo izaberite Sačuvaj nacrt ili učitajte sačuvanu verziju.')
      }
      accept(created)
      return created
    }
    if (!dirty) return version
    const saved = await saveContent(session, type.name, version._id, changedFields(), version.revision)
    accept(saved)
    return saved
  }
  async function run(action: 'draft' | 'publish' | 'preview' | 'discard' | 'delete' | 'archive' | 'hide' | 'reload') {
    if (!session || busyRef.current || uploadRef.current || expired) return
    busyRef.current = true; setWorking(true); setError(null); setNotice(null)
    let savedBeforeFailure = false
    try {
      if (action === 'reload') {
        if (!version) return
        accept(await fetchContent(session, type.name, version._id)); setNeedsReload(false)
        setNotice('Učitana je poslednja sačuvana verzija.')
        return
      }
      if (action === 'delete' || action === 'discard') {
        if (!version) return
        const result = await removeContent(session, type.name, version._id, version.revision, action === 'discard')
        void cache.invalidateQueries({ queryKey: ['contents', type.name] })
        if (result.deleted) { allowLeave(); router.back() }
        else { accept(await fetchContent(session, type.name, version._id)); setNotice('Nacrt je odbačen. Objavljena verzija je sačuvana.') }
        return
      }
      if (action === 'archive' || action === 'hide') {
        if (!version) return
        // Existing status action changes only public visibility, preserving any draft.
        await updateArtworkStatus(session, version._id, action === 'archive' ? 'archived' : 'draft')
        accept(await fetchContent(session, type.name, version._id))
        setNotice(action === 'archive' ? 'Rad je arhiviran i nije na sajtu.' : 'Rad je skriven sa sajta.')
        return
      }
      const saved = await persist()
      savedBeforeFailure = true
      if (action === 'draft') { setNotice('Nacrt je sačuvan. Sajt se menja tek objavom.'); return }
      if (action === 'publish') {
        const published = await publishContent(session, type.name, saved._id, saved.revision)
        accept(published); setNotice('Objavljeno. Sajt prikazuje sačuvani sadržaj.'); return
      }
      const slug = saved.document.slug as { current?: string } | undefined
      if (!slug?.current) throw new Error('Za pregled unesite adresu (slug) i sačuvajte nacrt.')
      const url = await getArtworkPreviewUrl(session, slug.current)
      await WebBrowser.openBrowserAsync(url)
      setNotice('Pregled je otvoren. Nacrt se objavljuje tek dugmetom Objavi.')
    } catch (e) {
      setError(`${savedBeforeFailure ? 'Nacrt je sačuvan. ' : ''}${e instanceof Error ? e.message : 'Radnja nije završena. Proverite vezu i pokušajte ponovo.'}`)
      if (e instanceof AdminApiError && (e.status === 409 || e.kind === 'network' || e.kind === 'timeout')) setNeedsReload(true)
    } finally { busyRef.current = false; setWorking(false) }
  }
  function confirm(action: 'publish' | 'discard' | 'delete' | 'archive' | 'hide' | 'reload') {
    const messages = {
      publish: ['Objavi sadržaj?', 'Sačuvane izmene postaće vidljive na sajtu.', 'Objavi'],
      discard: ['Odbaci nacrt?', 'Nacrt i nesačuvane izmene biće uklonjeni. Postojeća objavljena verzija ostaje.', 'Odbaci nacrt'],
      delete: ['Obriši dokument?', 'Biće obrisani nacrt i objavljena verzija. Brisanje nije moguće dok se dokument koristi u drugom sadržaju.', 'Obriši'],
      archive: ['Arhiviraj rad?', 'Rad će biti sakriven sa sajta. Sačuvani nacrt ostaje dostupan.', 'Arhiviraj'],
      hide: ['Sakrij rad sa sajta?', 'Objavljena verzija više neće biti vidljiva posetiocima. Sačuvani nacrt ostaje dostupan.', 'Sakrij'],
      reload: ['Učitaj sačuvanu verziju?', 'Nesačuvane izmene u ovoj formi biće odbačene. Učitaće se poslednja verzija sa servera.', 'Učitaj'],
    }
    const [title, message, label] = messages[action]
    Alert.alert(title, message, [{ text: 'Odustani', style: 'cancel' }, { text: label, style: action === 'publish' || action === 'reload' ? 'default' : 'destructive', onPress: () => void run(action) }])
  }
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><Screen scroll>
    <Text accessibilityRole="header" style={styles.title}>{type.title}</Text>
    <Feedback title={version ? versionLabels[version.publicationStatus] : 'Novi unos'} message={`${dirty ? 'Imate nesačuvane izmene. ' : ''}Sačuvajte nacrt, pregledajte i objavite kada ste spremni.`} />
    {error ? <Feedback title="Radnja nije završena" message={error} tone="error" /> : null}
    {notice ? <Feedback title={notice} tone="success" /> : null}
    {needsReload && version ? <Button label="Učitaj sačuvanu verziju" variant="secondary" disabled={busy} onPress={() => confirm('reload')} /> : null}
    <ContentFields fields={type.fields} value={values} onChange={(name, value) => { setValues(previous => {
      const next = { ...previous, [name]: value }
      if (!version && name === type.titleField && type.fields.some(field => field.kind === 'slug')) {
        const oldSlug = (previous.slug as {current?:string} | undefined)?.current
        const slugify = (text: unknown) => String(text ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'dj').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        if (!oldSlug || oldSlug === slugify(previous[name])) next.slug = { _type: 'slug', current: slugify(value) }
      }
      return next
    }); setNotice(null) }} disabled={busy} onBusyChange={value => { uploadRef.current = value; setUploading(value) }} />
    <View style={styles.actions}>
      {uploading ? <Feedback title="Slanje fotografije…" message="Sačekajte da se fotografija pošalje pre čuvanja." tone="loading" /> : null}
      <Button label="Sačuvaj nacrt" testID="content-save-draft" variant="secondary" disabled={busy} loading={working} onPress={() => void run('draft')} />
      {type.name === 'artwork' ? <Button label="Pregledaj na sajtu" testID="content-preview" variant="secondary" disabled={busy} onPress={() => void run('preview')} /> : null}
      <Button label={version?.hasPublished ? 'Objavi izmene' : 'Objavi'} testID="content-publish" disabled={busy} onPress={() => confirm('publish')} />
      {type.name === 'artwork' ? <Text style={styles.body}>Objava postavlja vidljivost rada na „Objavljeno“. Arhiviranje i skrivanje menjaju javnu vidljivost zasebno.</Text> : null}
      {type.name === 'artwork' && version?.hasPublished ? <>
        <Button label="Arhiviraj rad" variant="secondary" testID="content-archive" disabled={busy || dirty} onPress={() => confirm('archive')} />
        <Button label="Sakrij sa sajta" variant="secondary" testID="content-hide" disabled={busy || dirty} onPress={() => confirm('hide')} />
        {dirty ? <Text style={styles.body}>Sačuvajte izmene pre promene javne vidljivosti.</Text> : null}
      </> : null}
      {version?.hasDraft ? <Button label="Odbaci nacrt" variant="quiet" testID="content-discard" disabled={busy} onPress={() => confirm('discard')} /> : null}
      {version ? <Button label="Obriši dokument" variant="danger" testID="content-delete" disabled={busy} onPress={() => confirm('delete')} /> : null}
    </View>
  </Screen></KeyboardAvoidingView>
}
const styles = StyleSheet.create({ screen: { flex: 1 }, title: { ...textStyles.title, color: colors.ink }, body: { ...textStyles.body, color: colors.inkMuted }, actions: { gap: spacing.md, borderTopWidth: 1, borderColor: colors.canvasDeep, paddingTop: spacing.lg } })
