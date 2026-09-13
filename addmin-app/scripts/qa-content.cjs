/* global __dirname */
// Isolated synthetic UI data. No credentials, production writes or private messages.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const loaded = { exports: {} };
const source = fs.readFileSync(path.resolve(__dirname, '../../src/lib/admin-api/content-types.ts'), 'utf8');
new Function('exports', ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(loaded.exports);
const {contentTypes,validateContent} = loaded.exports;
const documents = new Map();
let counter = 0;
const revise = () => `fixture-${++counter}`;
function entry(type, id, fields, published = false) {
  return {_id:id,revision:revise(),hasDraft:!published,hasPublished:published,publicationStatus:published?'published':'draft',document:{_id:published?id:`drafts.${id}`,_type:type,...fields}};
}
for (const type of contentTypes) {
  const id = type.singleton || `qa-${type.name}`;
  const fields = Object.fromEntries(type.fields.filter(f=>f.initialValue!==undefined).map(f=>[f.name,f.initialValue]));
  fields[type.titleField] = `QA — ${type.title}`;
  if (type.fields.some(f=>f.kind==='slug')) fields.slug={_type:'slug',current:`qa-${type.name.toLowerCase()}`};
  if (type.name==='journalPost') {fields.publishedAt='2026-09-13';fields.body=[{_type:'block',_key:'qa-paragraph',style:'normal',markDefs:[],children:[{_type:'span',_key:'qa-span',text:'Izolovani tekst za Android proveru.',marks:[]}]}];}
  if (type.name==='exhibition') {fields.venue='QA prostor';fields.startDate='2026-09-13';}
  if (type.name==='educationItem') fields.type='workshop';
  if (type.name==='socialItem') {fields.platform='instagram';fields.externalUrl='https://example.com/qa';}
  const doc=entry(type.name,id,fields,type.name==='medium');
  if(doc.hasPublished) doc.published=structuredClone(doc.document);
  documents.set(id,doc);
}
// Sintetički radovi sa pravim seed fotografijama (servira qa-fixture sa /qa-art/), da se vidi izgled.
const art = (file, alt) => ({_type:'image',alt,asset:{_type:'reference',_ref:`image-qa${file.replace(/\W/g,'')}-800x800-jpg`,url:`http://127.0.0.1:4317/qa-art/${file}`}});
[['qa-art-1','oil/up5.jpg',true,'changed'],['qa-art-2','acrylic/ak1.jpg',true,'published'],['qa-art-3','watercolor/vt1.jpg',true,'published'],['qa-art-4','mosaic/mz1.jpg',false,'draft']].forEach(([id,file,published,state],index)=>{
  const fields={title:`QA rad ${index+1}`,slug:{_type:'slug',current:id},status:published?'published':'draft',primaryImage:art(file,'Sintetički opis slike'),featured:index<2,heroCandidate:index===0};
  const doc=entry('artwork',id,fields,published);
  if(published) {doc.published=structuredClone(doc.document); if(state==='changed'){Object.assign(doc,{hasDraft:true,publicationStatus:'changed'});}}
  documents.set(id,doc);
});
documents.get('qa-exhibition').document.images=[{...art('graphics/gr1.jpg','Postavka'),_key:'ex1'},{...art('oil/up2.jpg','Detalj'),_key:'ex2'}];
documents.get('artistProfile').document.portrait=art('oil/up4.jpg','Portret');
documents.get('siteSettings').document.featuredArtworks=[{_type:'reference',_ref:'qa-art-2',_key:'f1'},{_type:'reference',_ref:'qa-art-1',_key:'f2'}];
documents.get('siteSettings').document.heroArtwork={_type:'reference',_ref:'qa-art-2'};
function usageOf(id) {
  return [...documents.values()].filter(d=>d._id!==id).map(d=>{
    const owner=contentTypes.find(t=>t.name===d.document._type);
    const fields=(owner?.fields??[]).filter(f=>f.referenceType&&[].concat(d.document[f.name]??[]).some(r=>r&&r._ref===id));
    return fields.length?{_id:d._id,type:owner.name,typeTitle:owner.title,title:String(d.document[owner.titleField]??owner.title),fields:fields.map(f=>f.title),unlinkable:!fields.some(f=>f.required),names:fields.map(f=>[f.name,f.kind])}:null;
  }).filter(Boolean);
}
function clean(doc) {const {published,...value}=doc;return {...value,title:String(doc.document.title||doc.document.name||doc.document.siteTitle||doc.document.captionExcerpt||'Bez naslova')};}
module.exports = function qaContent(req, url, input, ok, fail) {
  if(!url.pathname.startsWith('/api/admin/content/')) return false;
  const [, , , ,typeName,id,action] = url.pathname.split('/').map(decodeURIComponent);
  if(typeName==='schema') {ok({types:contentTypes});return true;}
  const type=contentTypes.find(t=>t.name===typeName);
  if(!type) {fail(404,'Sekcija nije pronađena.');return true;}
  if(!id) {
    if(req.method==='GET') ok({contents:[...documents.values()].filter(d=>d.document._type===typeName).map(clean)});
    else {
      const existing=documents.get(input.clientId);
      if(existing) ok({content:{...clean(existing),existed:true}});
      else {const error=validateContent(type,input.fields||{},false);if(error) fail(400,error);else {const doc=entry(typeName,input.clientId,input.fields);documents.set(doc._id,doc);ok({content:clean(doc)},201);}}
    }
    return true;
  }
  const doc=documents.get(id);
  if(!doc) {fail(404,'Dokument nije pronađen.');return true;}
  if(req.method==='GET') {if(url.searchParams.get('usage')==='1') ok({usage:usageOf(id).map(({names,...u})=>u)}); else ok({content:clean(doc)});return true;}
  if(input.baseRevision!==doc.revision) {fail(409,'Sadržaj je izmenjen. Učitajte ponovo.');return true;}
  if(action==='discard'||req.method==='DELETE') {
    if(!input.confirm) {fail(400,'Potvrdite brisanje.');return true;}
    const usage=action==='discard'?[]:usageOf(id);
    if(usage.length&&!input.unlinkReferences) {fail(409,'Dokument se koristi u drugom sadržaju. Najpre uklonite povezivanja.');return true;}
    for(const u of usage) {const owner=documents.get(u._id); for(const [name,kind] of u.names) {if(kind==='references') owner.document[name]=owner.document[name].filter(r=>r._ref!==id); else delete owner.document[name];}}
    if(action==='discard'&&doc.published) Object.assign(doc,{document:structuredClone(doc.published),hasDraft:false,publicationStatus:'published',revision:revise()});
    else documents.delete(id);
    ok({_id:id,deleted:!documents.has(id)});return true;
  }
  const next=structuredClone(doc.document);
  for(const [key,value] of Object.entries(input.fields||{})) {if(value===null) delete next[key];else next[key]=value;}
  if(action==='publish'&&typeName==='artwork') next.status='published';
  const error=validateContent(type,next,action==='publish');
  if(error) {fail(400,error);return true;}
  Object.assign(doc,{document:next,revision:revise(),hasDraft:action!=='publish',hasPublished:doc.hasPublished||action==='publish'});
  doc.publicationStatus=doc.hasDraft?(doc.hasPublished?'changed':'draft'):'published';
  if(action==='publish') doc.published=structuredClone(next);
  ok({content:clean(doc)});return true;
};
