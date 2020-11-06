const ROOT = 'https://raw.githubusercontent.com/';
const MAX_MEMORY_CACHE = 1000;

// LRU (least recently used) cache
const cache = {};
let cacheSize = 0;

function getLRU(key) {
  const value = cache[key];
  if (!value)
    return undefined;
  delete cache[key];
  return cache[key] = value;
}

function setLRUOverwrite(key, value) {
  cacheSize += key.length + value.length;
  cacheSize > MAX_MEMORY_CACHE && delete cache[(Object.keys(cache))[0]];
  delete cache[key];
  return cache[key] = value;
}

//LRU ends

function mimeType(path) {
  const filetype = path.substr(path.lastIndexOf('.') + 1);
  return {
    'md': 'text/plain',
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css'
  }[filetype];
}

function cacheDuration(path) {
  const [user, project, version] = path.split('/');
  return version.match(/[\da-f]{40}/) ? 31556926 : -1;
}

async function fetchAndCache(path) {
  const ttl = cacheDuration(path);
  const serverCacheDirective = ttl ? {cf: {cacheTtl: ttl, cacheEverything: true}} : undefined;
  const rawGithubFile = await fetch(ROOT + path, serverCacheDirective);
  const result = new Response(rawGithubFile.body, ttl < 0 ? undefined : rawGithubFile);
  result.headers.set('Content-Type', mimeType(path));
  result.headers.set("Cache-Control", `max-age=${ttl}`);
  return result;
}

async function fetchFromMemoryCache(path, e) {
  const appCache = getLRU(path);
  if (appCache) {
    const {body, contentType, ttl} = JSON.parse(appCache);
    return new Response(body, {headers: {'x-app-cache-ttl': ttl, 'Content-Type': contentType}});
  }
  const response = await fetchAndCache(path);
  const clone = response.clone(); //todo do i need to clone the response?
  //e.waitUntil(async function () {
  const ttl = await clone.headers.get('Cache-Control');
  if (ttl === 'max-age=-1')
    return;
  const contentType = await clone.headers.get('Content-Type');
  const body = await clone.text();
  setLRUOverwrite(path, JSON.stringify({body, contentType, ttl}));
  //});
  return new Response(JSON.stringify(cache), response);
}

async function handleRequest(req, e) {
  const url = new URL(req.url);
  return await fetchFromMemoryCache(url.pathname.substr(1), e);
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request, e)));