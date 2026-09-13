import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { updateArtworkStatus } from '@/api/admin'
import { fetchContentUsage, removeContent, type ContentUsage } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { colors } from '@/theme/colors'
import { textStyles } from '@/theme/typography'
import { Artwork, Banner, PrimaryButton, Sheet } from './index'

export type DeleteTarget = { type: string; id: string; revision: string; title: string; imageUri: string | null; hasPublished: boolean }

/**
 * Brisanje je ravnopravna radnja (Atelje UI): sve što je objavljeno može da se obriše.
 * Ako se sadržaj koristi drugde, nudi se uklanjanje tih povezivanja u istoj transakciji.
 */
type Props = { target: DeleteTarget | null; onClose: () => void; onDeleted: () => void; onHidden?: () => void }
export function DeleteSheet(props: Props) {
  // Nova instanca po otvaranju: stanje provere i greške kreće od nule.
  if (!props.target) return null
  return <DeleteSheetContent key={`${props.target.type}/${props.target.id}/${props.target.revision}`} {...props} target={props.target} />
}
function DeleteSheetContent({ target, onClose, onDeleted, onHidden }: Props & { target: DeleteTarget }) {
  const { session } = useAuth()
  const [usage, setUsage] = useState<ContentUsage[] | null>(null)
  const [error, setError] = useState('')
  const [working, setWorking] = useState<'delete' | 'hide' | null>(null)

  useEffect(() => {
    if (!session) return
    let active = true
    fetchContentUsage(session, target.type, target.id)
      .then(result => { if (active) setUsage(result) })
      .catch(() => { if (active) setError('Nije proveren sadržaj koji koristi ovaj unos. Proverite vezu i pokušajte ponovo.') })
    return () => { active = false }
  }, [target, session])

  const blocked = usage?.some(item => !item.unlinkable) ?? false
  const used = (usage?.length ?? 0) > 0

  async function remove() {
    if (!session) return
    setWorking('delete'); setError('')
    try {
      await removeContent(session, target.type, target.id, target.revision, false, used)
      onDeleted()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Brisanje nije uspelo. Pokušajte ponovo.')
    } finally { setWorking(null) }
  }
  async function hide() {
    if (!session) return
    setWorking('hide'); setError('')
    try {
      await updateArtworkStatus(session, target.id, 'draft')
      onHidden?.()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Rad nije sklonjen sa sajta. Pokušajte ponovo.')
    } finally { setWorking(null) }
  }

  return <Sheet visible onClose={working ? () => undefined : onClose} testID="delete-sheet">
    <View style={styles.head}>
      {target.imageUri ? <Artwork uri={target.imageUri} style={styles.thumb} /> : null}
      <View style={styles.flex}>
        <Text style={styles.title}>Obrisati „{target.title || 'Bez naslova'}“?</Text>
        <Text style={styles.body}>{target.hasPublished ? 'Nestaje sa sajta i iz aplikacije.' : 'Nacrt se trajno uklanja.'} Ovo ne može da se vrati.</Text>
      </View>
    </View>
    {usage === null && !error ? <Text style={styles.body}>Proveravam gde se koristi…</Text> : null}
    {used ? <View style={styles.usage}>
      <Text style={styles.label}>{blocked ? 'Ne može automatski da se ukloni' : 'Koristi se na sajtu'}</Text>
      {usage!.map(item => <Text key={item._id} style={styles.body}>{item.typeTitle}{item.title && item.title !== item.typeTitle ? ` „${item.title}“` : ''}{item.fields.length ? ` — ${item.fields.join(', ')}` : ''}</Text>)}
      <Text style={styles.body}>{blocked ? 'Povezivanje je u obaveznom polju. Najpre ga promenite u tom sadržaju.' : 'Brisanje ga uklanja i odatle.'}</Text>
    </View> : null}
    {error ? <Banner title="Radnja nije završena" message={error} /> : null}
    <View style={styles.actions}>
      <PrimaryButton tone="danger" label={used ? 'Ukloni povezivanja i obriši' : 'Obriši'} disabled={usage === null || blocked || Boolean(working)} loading={working === 'delete'} onPress={() => void remove()} testID="delete-confirm" />
      {target.type === 'artwork' && target.hasPublished && onHidden ? <PrimaryButton tone="outline" label="Samo skloni sa sajta" disabled={Boolean(working)} loading={working === 'hide'} onPress={() => void hide()} testID="delete-hide" /> : null}
      <PrimaryButton tone="outline" label="Otkaži" disabled={Boolean(working)} onPress={onClose} style={styles.cancel} testID="delete-cancel" />
    </View>
  </Sheet>
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  head: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  thumb: { width: 68, height: 68, borderRadius: 10 },
  title: { ...textStyles.title, color: colors.ink },
  body: { ...textStyles.caption, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  label: { ...textStyles.label, color: colors.ink },
  usage: { backgroundColor: colors.canvasWarm, borderRadius: 12, padding: 14, gap: 4 },
  actions: { gap: 10, paddingTop: 4 },
  cancel: { borderWidth: 0 },
})
