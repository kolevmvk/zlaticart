export type Span = { _type: 'span'; _key: string; text: string; marks?: string[]; [key: string]: unknown }
export type Block = { _type: string; _key: string; children?: Span[]; style?: string; listItem?: string | null; level?: number | null; markDefs?: Record<string, unknown>[]; [key: string]: unknown }
export const textKey = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
export const blockText = (block: Block) => (block.children ?? []).map(span => span.text).join('')
export function editableBlock(block: Block) {
  return block._type === 'block' && Array.isArray(block.children) && block.children.every(span => span._type === 'span' && typeof span.text === 'string')
    && [undefined, 'normal', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(block.style)
    && [undefined, null, 'bullet', 'number'].includes(block.listItem)
    && (block.markDefs ?? []).every(def => def._type === 'link')
    && block.children.every(span => (span.marks ?? []).every(mark => ['strong','em','underline','strike-through','code'].includes(mark) || (block.markDefs ?? []).some(def=>def._key===mark)))
}
export function newBlock(): Block { return {_type:'block',_key:textKey(),style:'normal',markDefs:[],children:[{_type:'span',_key:textKey(),text:'',marks:[]}]} }
function segment(spans: Span[], start: number, end: number): Span[] {
  let offset = 0
  return spans.flatMap(span => {
    const from = Math.max(0,start-offset), to=Math.min(span.text.length,end-offset)
    offset += span.text.length
    return to>from ? [{...span,_key:from===0&&to===span.text.length?span._key:textKey(),text:span.text.slice(from,to)}] : []
  })
}
function unique(spans: Span[]) {
  const keys = new Set<string>()
  return spans.map(span=>{const key=keys.has(span._key)?textKey():span._key; keys.add(key);return {...span,_key:key}})
}
/** Only the changed text range is replaced; formatting and metadata outside it survive. */
export function replaceBlockText(block: Block, nextText: string): Block {
  if (!editableBlock(block)) return block
  const previous=blockText(block)
  if(previous===nextText) return block
  let start=0,end=previous.length,nextEnd=nextText.length
  while(start<end&&start<nextEnd&&previous[start]===nextText[start]) start++
  while(end>start&&nextEnd>start&&previous[end-1]===nextText[nextEnd-1]) {end--;nextEnd--}
  const children=block.children??[]
  const before=segment(children,0,start), after=segment(children,end,previous.length)
  const sample=segment(children,Math.max(0,start-1),Math.max(1,start))[0]??children[0]
  const inserted=nextText.slice(start,nextEnd)
  const spans=unique([...before,...(inserted?[{...sample,_type:'span' as const,_key:textKey(),text:inserted,marks:[...(sample?.marks??[])]}]:[]),...after])
  return {...block,children:spans.length?spans:[{_type:'span',_key:children[0]?._key??textKey(),text:'',marks:[]}]}
}
export function markSelection(block: Block, start: number, end: number, mark: string, definition?: Record<string, unknown>): Block {
  if(!editableBlock(block)||start>=end) return block
  const length=blockText(block).length
  start=Math.max(0,start);end=Math.min(length,end)
  const spans=block.children??[], selected=segment(spans,start,end)
  const remove=!definition&&selected.length>0&&selected.every(span=>(span.marks??[]).includes(mark))
  const mapped=selected.map(span=>({...span,marks:remove?(span.marks??[]).filter(m=>m!==mark):[...new Set([...(span.marks??[]),mark])]}))
  return {...block,children:unique([...segment(spans,0,start),...mapped,...segment(spans,end,length)]),
    ...(definition?{markDefs:[...(block.markDefs??[]),{...definition,_key:mark}]}:{})}
}
export function removeLinks(block: Block, start: number, end: number): Block {
  if(!editableBlock(block)||start>=end) return block
  const links=new Set((block.markDefs??[]).filter(def=>def._type==='link').map(def=>def._key))
  return {...block,children:unique([...segment(block.children??[],0,start),...segment(block.children??[],start,end).map(span=>({...span,marks:(span.marks??[]).filter(m=>!links.has(m))})),...segment(block.children??[],end,blockText(block).length)])}
}
