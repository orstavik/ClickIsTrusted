const ROOT = 'https://raw.githubusercontent.com/';

function mimeType(path) {
  const filetype = path.substr(path.lastIndexOf('.') + 1);
  return {
    'md': 'text/plain',
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css'
  }[filetype];
}

//how long to cache?
//KISS. You either don't cache = 0sec or cache forever = 1yr = 31556926sec.
//
//In the case of Github resources:
//If the reference is a permalink version? cache forever.
//Else, such as references to master? don't cache.
function cacheDuration(path){
  const [user, project, version] = path.split('/');
  return version.match(/[\da-f]{40}/) ? 31556926 : -1;
}

async function fetchAndCache(path) {
  const ttl = cacheDuration(path);
  const serverCacheDirective = ttl? {cf: {cacheTtl: ttl,cacheEverything: true}}: undefined;
  const rawGithubFile = await fetch(ROOT + path, serverCacheDirective);
  const result = new Response(rawGithubFile.body, ttl < 0? undefined: rawGithubFile);
  result.headers.set('Content-Type', mimeType(path));
  result.headers.set("Cache-Control", `max-age=${ttl}`);
  return result;
}

async function handleRequest(req) {
  const url = new URL(req.url);
  return await fetchAndCache(url.pathname.substr(1));
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));