const projectFolder = 'https://raw.githubusercontent.com/orstavik/ClickIsTrusted/master/experiments/cf_workers/mds/rawgit_tutorial/';

const cache = {};

class StyleLinkReader {

  constructor(location) {
    this.base = location;
    this.firstBase = false;
    this.links = [];
  }

  async element(el) {
    const href = el.getAttribute('href');
    if (!href)
      return;

    if (!this.firstBase && el.tagName === 'base') {
      this.base = new URL(href, this.base).href;
      this.firstBase = true;
    }

    if (el.tagName === 'link' && el.getAttribute('rel') === 'stylesheet')
      this.links.push(new URL(href, this.base).href);
  }
}

async function processHtml(response, fullPath, projectFolder) {
  const styleLinkReader = new StyleLinkReader(fullPath);
  const response2 = new HTMLRewriter()
    .on('link', styleLinkReader)
    .on('base', styleLinkReader)
    .transform(response);
  const body = await response2.text();
  const headers = {'content-type': 'text/html'};
  const links = styleLinkReader.links
    .filter(l => l.startsWith(projectFolder))
    .map(l => l.substr(projectFolder.length));
  headers['Link'] = links.map(l => `</${l}>; rel=preload; as=style`).join(', ');
  return {body, options: {headers}};
}

async function fetchAndServerPushStyle(request) {
  if (!cache[request.url]) {
    const url = new URL(request.url);
    const fullPath = projectFolder + (url.pathname || '');
    const response = await fetch(fullPath);
    if (fullPath.endsWith('.html')) {
      cache[request.url] = await processHtml(response, fullPath, projectFolder);
      console.log(cache[request.url]);
      return new Response(cache[request.url].body, cache[request.url].options);
    }
    if (fullPath.endsWith('.css')) {
      cache[request.url] = {body: await response.text(), options: {headers: {'Content-Type': 'text/css'}}};
      return new Response(cache[request.url].body, cache[request.url].options);
    }
    return response;
  }
  return new Response(cache[request.url].body, cache[request.url].options);
}

addEventListener('fetch', e => e.respondWith(fetchAndServerPushStyle(e.request)));