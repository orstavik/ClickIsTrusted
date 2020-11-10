const appCache = {};

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
function cacheDuration(path) {
  const [ignore, user, project, version] = path.split('/');
  return version.match(/[\da-f]{40}/) ? 31556926 : -1;
}

const otherServer = 'https://raw.githubusercontent.com';

async function makeCachePromise(url){
  const path = new URL(url).pathname;
  const response = await fetch(otherServer + path);
  const body =  await response.text();
  const headers = {
    'content-type': mimeType(path),
    'cache-control': `max-age=${cacheDuration(path)}`
  };
  return {body, options: {status: 200, headers}};
}

async function handleRequest(req) {
  const url = req.url;
  const {body, options} = appCache[url] || (appCache[url] = await makeCachePromise(url));
  return new Response(body, options);
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));