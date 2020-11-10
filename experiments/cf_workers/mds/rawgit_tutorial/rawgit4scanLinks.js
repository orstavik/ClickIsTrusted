const projectFolder = 'https://raw.githubusercontent.com/orstavik/ClickIsTrusted/master/experiments/cf_workers/mds/rawgit_tutorial/test/';

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

async function fetchAndServerPushStyle(request) {
  const url = new URL(request.url);
  const fullPath = projectFolder + (url.pathname || '');
  const response = await fetch(fullPath);
  const styleLinkReader = new StyleLinkReader(fullPath);
  const response2 = new HTMLRewriter()
    .on('link', styleLinkReader)
    .on('base', styleLinkReader)
    .transform(response);
  const body = await response2.text();
  console.log(JSON.stringify(styleLinkReader.links));
  return new Response(body, {headers: {'content-type': 'text/html'}});
}

addEventListener('fetch', e => e.respondWith(fetchAndServerPushStyle(e.request)));