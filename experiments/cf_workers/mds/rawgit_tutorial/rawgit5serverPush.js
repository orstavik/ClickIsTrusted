const projectFolder = 'https://raw.githubusercontent.com/orstavik/ClickIsTrusted/master/experiments/cf_workers/mds/rawgit_tutorial/';

class StyleLinkReader {

  constructor(location){
    this.base = location;
    this.firstBase = false;
    this.links = [];
  }

  async element(el) {
    const href = el.getAttribute('href');
    if(!href)
      return;

    if(!this.firstBase && el.tagName === 'base'){
      this.base = new URL(href, this.base).href;
      this.firstBase = true;
    }

    if(el.tagName === 'link' && el.getAttribute('rel') === 'stylesheet')
      this.links.push(new URL(href, this.base).href);
  }
}

async function processHtml(response, fullPath, projectFolder){
  const styleLinkReader = new StyleLinkReader(fullPath);
  const response2 = new HTMLRewriter()
    .on('link', styleLinkReader)
    .on('base', styleLinkReader)
    .transform(response);
  const body = await response2.text();
  const headers = {'content-type': 'text/html', 'x-ivar': '16'};
  const links = styleLinkReader.links
    .filter(l => l.startsWith(projectFolder))
    .map(l => l.substr(projectFolder.length));
  headers['Link'] =  links.map(l => `</${l}>; rel=preload; as=style`).join(', ');
  return new Response(body, {headers});
}

async function fetchAndServerPushStyle(request) {
  const url = new URL(request.url);
  const fullPath = projectFolder + (url.pathname || '');
  const response = await fetch(fullPath);
  if(fullPath.endsWith('.html'))
    return processHtml(response, fullPath, projectFolder);
  if(fullPath.endsWith('.css'))
    return new Response(response.body, {headers: {'x-ivar': 'boo', 'Content-Type': 'text/css'}});
  return response;
}

addEventListener('fetch', e => e.respondWith(fetchAndServerPushStyle(e.request)));