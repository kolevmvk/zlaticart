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
  if(req.method==='GET') {ok({content:clean(doc)});return true;}
  if(input.baseRevision!==doc.revision) {fail(409,'Sadržaj je izmenjen. Učitajte ponovo.');return true;}
  if(action==='discard'||req.method==='DELETE') {
    if(!input.confirm) {fail(400,'Potvrdite brisanje.');return true;}
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
