const ROOT = 'https://raw.githubusercontent.com/';

function mimeType(path){
  const filetype = path.substr(path.lastIndexOf('.')+1);
  return {
    'md': 'text/plain',
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css'
  }[filetype];
}

async function fetchAndReplaceContentTypeHeader(path) {
  const rawGithubFile = await fetch(ROOT + path);
  const result = new Response(rawGithubFile.body, rawGithubFile);
  result.headers.set('content-type', mimeType(path));
  return result;
}

async function handleRequest(req) {
  const url = new URL(req.url);
  return await fetchAndReplaceContentTypeHeader(url.pathname.substr(1));
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));