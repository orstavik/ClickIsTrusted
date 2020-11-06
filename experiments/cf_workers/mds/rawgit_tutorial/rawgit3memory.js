const ROOT = 'https://raw.githubusercontent.com/';
const KEYCACHE_SIZE = 1000;

// LRU (last recently used) cache
const LRU = {
  cache: {},
  get: function (key) {
    const value = LRU.cache[key];
    if (!value)
      return undefined;
    delete LRU.cache[key];
    return LRU.cache[key] = value;
  },
  put: function (key, value) {
    const keys = Object.keys(LRU.cache);
    keys.length > KEYCACHE_SIZE && delete LRU.cache[keys[0]];
    return LRU.cache[key] = value;
  }
};//LRU ends

function mimeType(path) {
  const filetype = path.substr(path.lastIndexOf('.') + 1);
  return {
    'md': 'text/plain',
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css'
  }[filetype];
}

function calculateTTL(path) {
  const [user, project, version] = path.split('/');
  return version.match(/[\da-f]{40}/) ? 31556926 : 0;
}

function makeResponse(body, mime, ttl, hitMiss) {
  return new Response(body, {
    headers: {
      'Content-Type': mime,
      "Cache-Control": `max-age=${ttl}`,
      "x-app-cache-status": hitMiss
    }
  });
}

async function handleRequest(req, e) {
  const url = new URL(req.url);
  const path = url.pathname.substr(1);

  const appCache = LRU.get(path);
  if (appCache) {
    const [body, mime, ttl] = appCache;
    return makeResponse(body, mime, ttl, 'hit');
  }

  const ttl = calculateTTL(path);
  const raw = await fetch(ROOT + path, {cf: {cacheTtl: ttl, cacheEverything: true}});
  const body = await raw.text();
  const mime = mimeType(path);
  if (ttl > 0)
    LRU.put(path, [body, mime, ttl]);
  return makeResponse(body, mime, ttl, 'miss');
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request, e)));