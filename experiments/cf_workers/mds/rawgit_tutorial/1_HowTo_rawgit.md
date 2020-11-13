# HowTo: Make a mini rawgit?

Your code is versioned and stored on github.com. You consider this source safe. You are thinking (correctly), that "if somebody were to hack github.com to alter some of the repositories, they wouldn't bother with a small fry fish such as me".

So, what you need is a cloudflare worker that can take a particular version of a folder in a github.com project, and serve that under a different domain. Ie. you want a mini rawgit.com.
 
## Requirements

1. translate:
    * `https://mini-rawgit-worker.my-super-project.workers.dev/some/path.html`

       into
    * `https://raw.githubusercontent.com/my-user-name/my-super-project/7552d9968e3cf8e11612696ea3f7fd42556d62e3/production/folder/some/path.html`.

2. add a correct `content-type` header. If we don't do this, the browser will not run neither html, css, nor js files. Thus: `some/path.html` => `'content-type' = text/html`. Convert filetype into mime-type.

3. cache in the workers' memory the files retrieved from github, so that the same worker instance will not need to go over the network to retrieve the same file for the next request.
   1. The worker has very limited memory resources, but this often still work fine because the *mini* rawgit only serve a *mini* folder from github that contains a few, small html, js, css files. If however, you serve content from a large github subsection, this will not work. And if so, then you must either selectively cache only 1) html, 2) css, and 3) js files that are loaded synchronously and that therefore blocks page loading.
   2. Can we cache this version? Some github versions change all the time, while some are reference using permanent links. If the version is a 40 char long hexadecimal string, then we consider it a permanent link, and the worker will cache it for forever = 1yr = 31556926sec.

4. provide two custom queryParameters: `https://mini-rawgit-worker.my-super-project.workers.dev/some/path.html?nocache&v=master` 
   1. `nocache`: stops the worker from checking the cache for a cached version of the app.   
   2. `v=github-folder`: alters the location of the github folder to point to another specific version or the head of a branch in the github folder.

## Comments on state

There is a global property called `MY_GITHUB_PROJECT`. This is a url to a folder to a `https://raw.githubusercontent.com`. This folder should not end with `/`;

The worker uses an `inMemoryCache` dictionary to cache all cacheable requests between requests. If two requests hit the same worker instance in quick succession before the worker has had a chance to populate the cache, then only the first cache will trigger the method that updates the cache for that file. 
   
## Demo: mini-rawgit-worker

In addition to the pure functions above, this worker performs two tasks:

1. it will create an . This object will map a path string to a  

```javascript
const MY_GITHUB_PROJECT = 'https://raw.githubusercontent.com/orstavik/ClickIsTrusted/606e29db8fdf8e207ac9ab0252a10e3126008e45/experiments/cf_workers/mds/rawgit_tutorial';

const githubUrl = new URL(MY_GITHUB_PROJECT);
const GITHUB_PIECES = githubUrl.pathname.split('/');
GITHUB_PIECES[0] = githubUrl.origin;

/**
 * @param {string} pathIn
 * @param {string} version
 * @returns {string} corresponding path on `https://raw.githubusercontent.com/`.
 */
function translate(pathIn, version) {
  if(!version)
    return MY_GITHUB_PROJECT + pathIn
  const pieces = GITHUB_PIECES.concat([pathIn]);
  version && (pieces[3] = version); 
  return pieces.join('/');
}

/**
 * @param {string} path
 * @returns {string} the correct content-type value for a particular path/filename.
 */
function mimeType(path) {
  const filetype = path.substr(path.lastIndexOf('.')+1);
  return {
    'md': 'text/plain',
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css'
  }[filetype];
}

/**
 * For(n)ever cache strategy, 
 * If the version is a github version permalink, then 'cache forever': 1yr = 31556926sec.
 * Else, the version is not a permalink, then don't cache = -1. 
 * 
 * @param {string} version
 * @returns {number} 31556926 || -1; 
 */
function cacheDuration(version) {
  return version?.match(/[\da-f]{40}/) ? 31556926 : -1;
}

/**
 * Will put the cb function in the worker's event loop queue, 
 * to be executed asap, while keeping preventing the FetchEvent context
 * from being closed.
 * 
 * This is typically useful for letting the response be passed out to the
 * browser first, and then do post production tasks such as preparing a inMemory
 * cache for the next request to the same path.
 * 
 * todo do we really benefit from this?? or do e.respondWith(...) pass out the result without interference from the caching task? Also, do we need more time in the timeout to accomplish this? 
 * 
 * @param {FetchEvent} e
 * @param {Function} cb
 */
function postProduction(e, cb){
  e.waitUntil(new Promise(r => setTimeout(async () => await cb() & r(), 0)));
}

const imc = {}; //in memory cache

async function handleRequest(e) {
  //1. parse the incoming request
  const url = new URL(e.request.url);
  const path = url.pathname;
  const version = url.searchParams.get('v');
  const noCache = url.searchParams.get('nocache') !== null;
  const maxAge = cacheDuration(version || GITHUB_PIECES[3]);
  const cacheable = !noCache && maxAge > 0;  

  //2. try the cache first
  if(cacheable && imc[path])
    return new Response(imc[path].body, imc[path].options);

  //3. fetch from raw.githubusercontent.com  
  const rawGithubFile = await fetch(translate(path, version));
  const options = {status: 200, headers:{
    'content-type': mimeType(path),
    'cache-control': `max-age=${maxAge}`,
    'x-app-cache': 0 
  }};
  
  //4. cache body and header for future requests to the same worker instance.
  //   If another request has already started such a task, but not yet finished, then don't queue a second process.
  if(cacheable && imc[path] === undefined){
    imc[path] = null;
    const clone = rawGithubFile.clone();
    postProduction(e, async function(){
      imc[path] = {
        body: await clone.text(),
        options
      };
      imc[path].options.headers['x-app-cache'] = 1;
    });  
  }
  return new Response(rawGithubFile.body, options);
}

addEventListener('fetch', e => e.respondWith(handleRequest(e)));
```

## Comments

The worker will only tell the browser to cache github permalinks, all other files should have a cache to be 0. This should mean that if a developer is working against a `master` version, then for such files, the browser's native cache will not be active. (This doesn't apply to the service worker cache though.)  

When the global variables are altered, the worker will be restarted and all in memory cache will be wiped. This is not a problem, it is fine.

If the content of the cache exceeds the worker memory limit, then use an LRU cache instead.

## References

 * dunno yet