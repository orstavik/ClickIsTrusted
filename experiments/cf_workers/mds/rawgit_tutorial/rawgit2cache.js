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

async function handleRequest(req) {
  //1. parse the incoming request
  const url = new URL(req.url);
  const path = url.pathname.substr(1);
  const ttl = cacheDuration(path);

  //2. fetch the origin file. Use CF workers fetch to cache directive
  const serverCacheDirective = ttl? {cf: {cacheTtl: ttl,cacheEverything: true}}: undefined;
  const rawGithubFile = await fetch(ROOT + path, serverCacheDirective);

  //3. update the response, mime-type and cache-control
  const result = new Response(rawGithubFile.body, ttl < 0? undefined: rawGithubFile);
  result.headers.set('Content-Type', mimeType(path));
  result.headers.set("Cache-Control", `max-age=${ttl}`);

  //4. return the result
  return result;
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));