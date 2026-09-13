'use client'
import Image from 'next/image'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { RichText } from '@/lib/content/types'
const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="mb-4 whitespace-pre-wrap">{children}</p>,
    h1: ({children}) => <h1 className="font-serif text-4xl my-6">{children}</h1>,
    h2: ({children}) => <h2 className="font-serif text-3xl my-5">{children}</h2>,
    h3: ({children}) => <h3 className="font-serif text-2xl my-4">{children}</h3>,
    h4: ({children}) => <h4 className="font-serif text-xl my-4">{children}</h4>,
    h5: ({children}) => <h5 className="font-serif text-lg my-4">{children}</h5>,
    h6: ({children}) => <h6 className="font-serif text-base my-4">{children}</h6>,
    blockquote: ({children}) => <blockquote className="border-l-2 border-ink/30 pl-5 italic my-6">{children}</blockquote>,
  },
  list: {bullet:({children})=><ul className="list-disc pl-6 mb-4">{children}</ul>,number:({children})=><ol className="list-decimal pl-6 mb-4">{children}</ol>},
  marks: {link:({value,children})=> {
    const href=typeof value?.href==='string'?value.href:''
    return /^(https?:\/\/|mailto:|tel:|\/[^/]|#)/i.test(href)?<a href={href} className="underline underline-offset-4" rel="noopener noreferrer">{children}</a>:<>{children}</>
  }},
  types: {image:({value})=> {
    const match=typeof value?.asset?._ref==='string'?value.asset._ref.match(/^image-([a-zA-Z0-9]+)-(\d+)x(\d+)-(jpg|jpeg|png|webp|gif|avif)$/):null
    if(!match)return null
    const project=process.env.NEXT_PUBLIC_SANITY_PROJECT_ID??'qm16j7ru',dataset=process.env.NEXT_PUBLIC_SANITY_DATASET??'production'
    return <figure className="my-8"><Image src={`https://cdn.sanity.io/images/${project}/${dataset}/${match[1]}-${match[2]}x${match[3]}.${match[4]}`} width={Number(match[2])} height={Number(match[3])} alt={typeof value.alt==='string'?value.alt:''} sizes="(max-width: 768px) 100vw, 768px" className="w-full h-auto"/></figure>
  }},
}
export default function ContentRichText({value}:{value?:RichText|null}) {
  if(typeof value==='string') return <div className="whitespace-pre-line">{value}</div>
  if(!Array.isArray(value)||!value.length)return null
  return <PortableText value={value} components={components}/>
}
