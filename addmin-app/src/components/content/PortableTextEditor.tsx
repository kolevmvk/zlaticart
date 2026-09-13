import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import type { ContentField } from '@/api/content'
import { Button, Feedback, Field } from '@/components/ui'
import { ImageField } from './ImageField'
import { blockText, editableBlock, markSelection, newBlock, removeLinks, replaceBlockText, textKey, type Block } from '@/lib/portable-text'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'
const stylesList = [['normal','Pasus'],['h1','Naslov 1'],['h2','Naslov 2'],['h3','Naslov 3'],['h4','Naslov 4'],['h5','Naslov 5'],['h6','Naslov 6'],['blockquote','Citat']]
const marks = [['strong','Podebljano'],['em','Kurziv'],['underline','Podvučeno'],['strike-through','Precrtano'],['code','Kod']]
function BlockEditor({block,onChange,disabled,index}:{block:Block;onChange:(block:Block)=>void;disabled?:boolean;index:number}) {
  const [selection,setSelection]=useState({start:0,end:0})
  const [link,setLink]=useState('')
  const [linkOpen,setLinkOpen]=useState(false)
  const [formatOpen,setFormatOpen]=useState(false)
  const [error,setError]=useState('')
  function decorate(mark:string) {
    if(selection.start===selection.end) {setError('Najpre označite deo teksta dugim pritiskom.');return}
    setError('');onChange(markSelection(block,selection.start,selection.end,mark))
  }
  function addLink() {
    if(selection.start===selection.end) {setError('Označite tekst koji postaje link.');return}
    if(!/^(https?:\/\/|mailto:|tel:|\/[^/]|#)/i.test(link.trim())) {setError('Unesite https://, mailto: ili internu adresu.');return}
    onChange(markSelection(removeLinks(block,selection.start,selection.end),selection.start,selection.end,textKey(),{_type:'link',href:link.trim()}));setLinkOpen(false);setLink('');setError('')
  }
  return <View style={styles.group}>
    <Field label={`Tekst ${index+1}`} multiline value={blockText(block)} editable={!disabled} onChangeText={text=>onChange(replaceBlockText(block,text))} onSelectionChange={event=>setSelection(event.nativeEvent.selection)} style={styles.input} testID={`rich-text-${block._key}`} />
    <View accessibilityLabel="Prikaz formatiranja" style={styles.preview}>{(block.children??[]).map(span=><Text key={span._key} style={[styles.text,(span.marks??[]).includes('strong')&&styles.bold,(span.marks??[]).includes('em')&&styles.italic,(span.marks??[]).some(m=>m==='underline'||(block.markDefs??[]).some(d=>d._key===m&&d._type==='link'))&&styles.underline,(span.marks??[]).includes('strike-through')&&styles.strike]}>{span.text}</Text>)}</View>
    <Button label={formatOpen?'Zatvori formatiranje':'Formatiranje teksta'} variant="secondary" disabled={disabled} onPress={()=>setFormatOpen(!formatOpen)} />
    {formatOpen?<View style={styles.group}>
      <Text style={styles.text}>Označite reči u polju iznad, pa izaberite oznaku. Ponovni pritisak je uklanja.</Text>
      <View style={styles.tools}>{marks.map(([mark,label])=><Button key={mark} label={label} variant="secondary" disabled={disabled} onPress={()=>decorate(mark)} testID={`rich-${mark}`} />)}</View>
      <View style={styles.tools}>{stylesList.map(([value,label])=><Pressable key={value} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{checked:(block.style??'normal')===value,disabled}} disabled={disabled} onPress={()=>onChange({...block,style:value})} style={styles.option}><Text style={styles.text}>{(block.style??'normal')===value?'● ':''}{label}</Text></Pressable>)}</View>
      <View style={styles.tools}>{[['','Bez liste'],['bullet','Lista sa tačkama'],['number','Numerisana lista']].map(([value,label])=><Button key={value} label={label} variant="secondary" disabled={disabled} onPress={()=>onChange({...block,listItem:value||null,level:value?(block.level??1):null})} />)}</View>
      {block.listItem?<><Button label="Uvuci listu" variant="quiet" disabled={disabled||(block.level??1)>=6} onPress={()=>onChange({...block,level:(block.level??1)+1})}/><Button label="Izvuci listu" variant="quiet" disabled={disabled||(block.level??1)<=1} onPress={()=>onChange({...block,level:(block.level??1)-1})}/></>:null}
      <Button label="Dodaj link označenom tekstu" variant="secondary" disabled={disabled} onPress={()=>setLinkOpen(!linkOpen)} />
      <Button label="Ukloni link iz označenog teksta" variant="quiet" disabled={disabled} onPress={()=>onChange(removeLinks(block,selection.start,selection.end))} />
      {linkOpen?<><Field label="Adresa linka" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" editable={!disabled}/><Button label="Sačuvaj link" disabled={disabled} onPress={addLink}/></>:null}
      {(block.markDefs??[]).filter(def=>def._type==='link').map(def=><Text key={String(def._key)} style={styles.text}>Link: {String(def.href)}</Text>)}
    </View>:null}
    {error?<Feedback title={error} tone="error"/>:null}
  </View>
}
export function PortableTextEditor({field,value,onChange,disabled,onBusyChange}:{field:ContentField;value:unknown;onChange:(value:unknown)=>void;disabled?:boolean;onBusyChange:(busy:boolean)=>void}) {
  const blocks=(Array.isArray(value)?value:[]) as Block[]
  function update(index:number,block:Block){onChange(blocks.map((old,i)=>i===index?block:old))}
  function move(index:number,by:number){const next=[...blocks];[next[index],next[index+by]]=[next[index+by],next[index]];onChange(next)}
  function remove(index:number){Alert.alert('Ukloni blok?','Tekst ili fotografija u ovom bloku biće uklonjeni iz forme.',[{text:'Odustani',style:'cancel'},{text:'Ukloni',style:'destructive',onPress:()=>onChange(blocks.filter((_,i)=>i!==index))}])}
  return <View style={styles.group}>
    {blocks.map((block,index)=><View key={block._key} style={styles.card}>
      {block._type==='image'&&field.allowImages?<ImageField field={{...field,kind:'image'}} value={block} disabled={disabled} onBusyChange={onBusyChange} onChange={next=>{if(next)update(index,{...next as Block,_key:block._key});else onChange(blocks.filter((_,i)=>i!==index))}}/>:editableBlock(block)?<BlockEditor block={block} index={index} disabled={disabled} onChange={next=>update(index,next)}/>:<Feedback title="Poseban blok je zaštićen" message="Sadržaj i formatiranje ostaju sačuvani. Ovaj format se uređuje u Studio-u."/>}
      <View style={styles.tools}><Button label={`Blok ${index+1}: gore`} variant="quiet" disabled={disabled||index===0} onPress={()=>move(index,-1)}/><Button label={`Blok ${index+1}: dole`} variant="quiet" disabled={disabled||index===blocks.length-1} onPress={()=>move(index,1)}/><Button label={`Ukloni blok ${index+1}`} variant="quiet" disabled={disabled} onPress={()=>remove(index)}/></View>
    </View>)}
    <Button label="Dodaj pasus" testID={`field-${field.name}-paragraph`} variant="secondary" disabled={disabled} onPress={()=>onChange([...blocks,newBlock()])}/>
    {field.allowImages?<Button label="Dodaj fotografiju u tekst" testID={`field-${field.name}-image`} variant="secondary" disabled={disabled} onPress={()=>onChange([...blocks,{_type:'image',_key:textKey()}])}/>:null}
  </View>
}
const styles=StyleSheet.create({group:{gap:spacing.sm},card:{padding:spacing.md,gap:spacing.md,borderWidth:1,borderColor:colors.canvasDeep},tools:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},input:{minHeight:130,textAlignVertical:'top'},text:{...textStyles.body,color:colors.ink},preview:{flexDirection:'row',flexWrap:'wrap'},bold:{fontWeight:'700'},italic:{fontStyle:'italic'},underline:{textDecorationLine:'underline'},strike:{textDecorationLine:'line-through'},option:{minHeight:48,padding:spacing.md,justifyContent:'center',backgroundColor:colors.canvasWarm}})
