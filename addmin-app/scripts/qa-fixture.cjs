/* global __dirname */
// Synthetic in-memory UI fixture. Loopback only; never connect this server to production. Any PIN is accepted.
// Prati ugovor nacrta: čuvanje pravi/menja nacrt (hasDraft), sajt se menja tek objavom (status).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const qaContent = require('./qa-content.cjs');

let revisionCounter = 0;
const nextRevision = () => `qa-rev-${++revisionCounter}`;
const medium = { _id: 'qa-medium', title: 'Ulje na platnu' };
const artworks = [
  { _id: 'qa-draft', title: 'QA — Jesenja tišina', slug: 'qa-jesenja-tisina', status: 'draft', hasDraft: true, hasPublished: false, revision: nextRevision(), year: 2026, featured: false, thumbnailUrl: 'http://127.0.0.1:4317/qa-image.png', dimensions: '60 × 80 cm', shortDescription: 'Izolovani testni rad. Nije povezan sa CMS-om.', heroCandidate: false, medium, primaryImageAlt: 'Testni opis slike' },
  { _id: 'qa-published', title: 'QA — Svetlost u ateljeu', slug: 'qa-svetlost', status: 'published', hasDraft: false, hasPublished: true, revision: nextRevision(), year: 2025, featured: true, thumbnailUrl: null, dimensions: null, shortDescription: null, heroCandidate: false, medium: null, primaryImageAlt: null },
];
const createdByClientId = new Map();

function applyForm(artwork, input) {
  for (const key of ['title', 'year', 'dimensions', 'shortDescription', 'featured', 'heroCandidate']) {
    if (key in input) artwork[key] = input[key];
  }
  if ('mediumId' in input) artwork.medium = input.mediumId ? medium : null;
  if (input.primaryImage) artwork.primaryImageAlt = input.primaryImage.alt;
  else if (typeof input.primaryImageAlt === 'string') artwork.primaryImageAlt = input.primaryImageAlt;
}
const written = artwork => ({ _id: artwork._id, revision: artwork.revision, slug: artwork.slug });

http.createServer(async (req, res) => {
  let body = '';
  for await (const chunk of req) body += chunk;
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/'); // ['', 'api', 'admin', 'artworks', id, action]
  const isJson = (req.headers['content-type'] || '').includes('application/json');
  const input = isJson && body ? JSON.parse(body) : {};
  const send = (status, payload) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  };
  const ok = (data, status = 200) => send(status, { ok: true, data });
  const fail = (status, error) => send(status, { ok: false, error });

  if (url.pathname === '/qa-image.png') {
    res.writeHead(200, { 'Content-Type': 'image/png' });
    fs.createReadStream(path.join(__dirname, '../assets/icon.png')).pipe(res);
    return;
  }
  if (url.pathname === '/qa-preview') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Izolovani QA pregled</h1><p>Nije povezan sa CMS-om.</p>');
    return;
  }
  if (url.pathname === '/api/admin/login') return ok({ token: 'isolated-qa-fixture-session' });
  if (url.pathname === '/api/admin/logout') return ok({ loggedOut: true });
  if (url.pathname === '/api/admin/media') return ok({ mediums: [medium] });
  if (url.pathname === '/api/admin/upload-image') return ok({ assetId: `image-qa-${Date.now()}`, url: 'http://127.0.0.1:4317/qa-image.png' });
  if (url.pathname === '/api/admin/preview-link') return ok({ url: 'http://127.0.0.1:4317/qa-preview' });

  if (qaContent(req, url, input, ok, fail)) return;

  if (url.pathname === '/api/admin/artworks') {
    if (req.method === 'GET') return ok({ artworks });
    if (req.method === 'POST') {
      const existing = createdByClientId.get(input.clientId);
      if (existing) return ok({ ...written(existing), existed: true });
      const artwork = { _id: input.clientId || `qa-created-${Date.now()}`, slug: `qa-created-${Date.now()}`, status: 'draft', hasDraft: true, hasPublished: false, revision: nextRevision(), thumbnailUrl: null, medium: null, primaryImageAlt: null };
      applyForm(artwork, input);
      artworks.push(artwork);
      if (input.clientId) createdByClientId.set(input.clientId, artwork);
      return ok({ ...written(artwork), existed: false }, 201);
    }
  }

  if (parts[3] === 'artworks' && parts[4]) {
    const artwork = artworks.find(item => item._id === decodeURIComponent(parts[4]));
    if (!artwork) return fail(404, 'Artwork not found.');
    const action = parts[5];
    if (!action && req.method === 'GET') return ok({ artwork });
    if (!action && req.method === 'PATCH') {
      if (input.baseRevision && input.baseRevision !== artwork.revision) return fail(409, 'Artwork changed. Reload it before saving again.');
      applyForm(artwork, input);
      Object.assign(artwork, { hasDraft: true, revision: nextRevision() });
      return ok(written(artwork));
    }
    if (action === 'publish' && req.method === 'POST') {
      if (input.revision && input.revision !== artwork.revision) return fail(409, 'Artwork changed. Reload it before saving again.');
      if (!artwork.title || !artwork.primaryImageAlt) return fail(400, 'A primary image alt description is required to publish artwork.');
      Object.assign(artwork, { status: 'published', hasDraft: false, hasPublished: true, revision: nextRevision() });
      return ok({ ...written(artwork), status: 'published' });
    }
    if (action === 'status' && req.method === 'PATCH') {
      if (input.status === 'published') Object.assign(artwork, { status: 'published', hasDraft: false, hasPublished: true });
      else artwork.status = input.status;
      artwork.revision = nextRevision();
      return ok({ _id: artwork._id, status: artwork.status });
    }
  }

  fail(405, 'QA fixture: ova ruta nije podržana.');
}).listen(4317, '127.0.0.1', () => console.log('Isolated in-memory QA fixture on 127.0.0.1:4317'));
