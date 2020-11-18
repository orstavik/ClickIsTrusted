# HowTo: auth with github

> https://developer.github.com/apps/building-github-apps/creating-a-github-app/
> https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/

1. make a worker at this address:
`https://its-auth-github.2js-no.workers.dev`

2. login in to github.com and make a new application using:
`https://github.com/settings/applications/new`.
To update the settings, go to:
`https://github.com/settings/applications/`.

3. the domain of the app is the worker, the callback is the worker address + `/fromGithub`  

```javascript
const GITHUB_CLIENTID = '0c89d5ed6ca90c245bb6';
const GITHUB_CLIENTSECRET = '1994dc316b43dc8a58e0cf8f027d93523ccaf85a';
const GITHUB_REDIRECT = 'https://its-auth-github.2js-no.workers.dev/fromGithub';

//todo here we should encrypt a timestamp, and then we can verify that this timestamp is still valid.
function randomString(length){
  const iv = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

function makeGITHUBRedirect(state, client_id, redirect_url){
  const data = Object.assign({
    state, 
    client_id, 
    redirect_url, 
    // nonce: randomString(12) //todo test if we can add this one..
  }, {
    scope:'user',
    //login: 'don't have a hint about which user' //todo not included.
  });
  return 'https://github.com/login/oauth/authorize?'+
    Object.entries(data).map(([k, v])=>k +'='+encodeURIComponent(v)).join('&');
}

async function fetchTokenGITHUB(code, client_id, redirect_uri, client_secret, state) {
  const data = {code, client_id, client_secret, redirect_uri, state};
  const dataString = Object.entries(data).map(([k, v])=>k +'='+encodeURIComponent(v)).join('&');

  const fromGITHUB = await fetch('https://github.com/login/oauth/access_token',{
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: dataString
  });
  return fromGITHUB.text();
}

const states = [];

async function handleRequest(req){
  const url = new URL(req.url);
  const [ignore, action, data] = url.pathname.split('/');
  if(action==='mainpage'){
    return new Response('mainpage, logoutlink, loginlink');
  }
  if(action==='login'){
    const state = randomString(12);
    states.push(state);
    const redirectUrl = makeGITHUBRedirect(state, GITHUB_CLIENTID, GITHUB_REDIRECT);
    return Response.redirect(redirectUrl);
  }
  if(action==='fromGithub'){
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if(states.indexOf(state) === -1)
      return new Response('state is lost');
    const data = await fetchTokenGITHUB(code, GITHUB_CLIENTID, GITHUB_REDIRECT, GITHUB_CLIENTSECRET, state);
    const x = {}; 
    data.split('&').map(pair=>pair.split('=')).forEach(([k,v])=>x[k] = v);
    const accessToken = x['access_token'];
    const user = await fetch('https://api.github.com/user', {
      status: 201,
      headers: {
        'Authorization': 'token ' + accessToken,
        'User-Agent': '2js-no',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    const userText = await user.text();
    return new Response(userText, {status: 201});
  }
  return new Response('hello sunshine GITHUB oauth12');
}

addEventListener('fetch', e=> e.respondWith(handleRequest(e.request)));
```

## ref
 * [how to use the accesstoken to get the user data from github](https://developer.github.com/v3/#authentication)