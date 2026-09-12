/* global __dirname */
// Synthetic in-memory UI fixture. Loopback only; never connect this server to production. Any PIN is accepted.
const http = require('node:http');
const artworks = [
{_id:'qa-draft',title:'QA — Jesenja tišina',slug:'qa-jesenja-tisina',status:'draft',year:2026,featured:false,thumbnailUrl:'http://127.0.0.1:4317/qa-image.png',dimensions:'60 × 80 cm',shortDescription:'Izolovani testni rad. Nije povezan sa CMS-om.',heroCandidate:false,medium:{_id:'qa-medium',title:'Ulje na platnu'},primaryImageAlt:'Testni opis slike'},
{_id:'qa-published',title:'QA — Svetlost u ateljeu',slug:'qa-svetlost',status:'published',year:2025,featured:true,thumbnailUrl:null,dimensions:null,shortDescription:null,heroCandidate:false,medium:null,primaryImageAlt:null}
];
http.createServer(async(req,res)=>{
let body='';for await(const chunk of req) body+=chunk;
let data;const url=new URL(req.url,'http://localhost');
if(url.pathname==='/qa-image.png'){res.writeHead(200,{'Content-Type':'image/png'});require('node:fs').createReadStream(require('node:path').join(__dirname, '../assets/icon.png')).pipe(res);return;}
if(url.pathname==='/api/admin/login') data={token:'isolated-qa-fixture-session'};
else if(url.pathname==='/api/admin/logout')data={loggedOut:true};
else if(url.pathname==='/api/admin/artworks'&&req.method==='GET')data={artworks};
else if(url.pathname==='/api/admin/media')data={mediums:[{_id:'qa-medium',title:'Ulje na platnu'}]};
else if(url.pathname.startsWith('/api/admin/artworks/')&&req.method==='PATCH'){const a=artworks.find(a=>a._id===url.pathname.split('/')[4]); const input=JSON.parse(body||'{}'); if(a){Object.assign(a,input); if('mediumId' in input)a.medium=input.mediumId?{_id:input.mediumId,title:'Ulje na platnu'}:null;}data={_id:a?._id};}
else if(url.pathname==='/api/admin/artworks'&&req.method==='POST'){const a={_id:'qa-created-'+Date.now(),...JSON.parse(body),thumbnailUrl:null,slug:'qa-created'};artworks.push(a);data={_id:a._id};}
else if(url.pathname==='/api/admin/preview-link'){data={url:'http://127.0.0.1:4317/qa-preview'};}
else if(url.pathname==='/qa-preview'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end('<h1>Izolovani QA pregled</h1><p>Nije povezan sa CMS-om.</p>');return;}
else if(url.pathname.startsWith('/api/admin/artworks/')&&req.method==='GET')data={artwork:artworks.find(a=>a._id===url.pathname.split('/').pop())};
else {res.writeHead(405,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:'QA fixture: mutacije nisu omogućene.'}));return;}
res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,data}));
}).listen(4317,'127.0.0.1',()=>console.log('Isolated in-memory QA fixture on 127.0.0.1:4317'));
