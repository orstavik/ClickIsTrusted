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

async function handleRequest(req) {
  //1. parse the incoming request
  const url = new URL(req.url);
  const path = url.pathname.substr(1);

  //2. fetch the origin file
  const rawGithubFile = await fetch(ROOT + path);

  //3. update the response, as needed
  const result = new Response(rawGithubFile.body, rawGithubFile);
  result.headers.set('content-type', mimeType(path));

  //4. return the result
  return result;
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));