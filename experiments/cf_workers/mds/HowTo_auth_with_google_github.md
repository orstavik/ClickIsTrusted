# HowTo: auth with google AND github

```javascript
function randomString(length) {
  const iv = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

//Base64url
function toBase64url(base64str) {
  return base64str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64url(base64urlStr) {
  base64urlStr = base64urlStr.replace(/-/g, '+').replace(/_/g, '/');
  if (base64urlStr.length % 4 === 2)
    return base64urlStr + '==';
  if (base64urlStr.length % 4 === 3)
    return base64urlStr + '=';
  return base64urlStr;
}
//Base64url end

//CROSS REQUEST STATE SECRET
//const STATE_SECRET_TTL_MS = 3 * 60 * 1000;
//const STATE_SECRET_REGISTRY_LENGTH = 10000; //10000 = 24 000kb max size.
const states = [];               //i don't have a clean up method for the registry length.

function getStateSecret(ttl, stateRegistrySize) {
  //1. the secret is a hexString of a random number
  const secret = randomString(12);

  //2. states is an LRU cache
  states.length > stateRegistrySize && states.shift();
  states.push(secret);

  //3. The state secrets on live in the memory of cf worker until the timeout is reached.
  //   When the timeout is reached, the state is deleted from the memory.
  setTimeout(() => hasStateSecretOnce(secret), ttl);
  return secret;
}

//The state secret is a nonce.
//If it is read once, then it is also deleted from the state secret registry at the same time.
function hasStateSecretOnce(state) {
  const index = states.indexOf(state);
  return index >= 0 ? states.splice(index, 1) : false;
}

//CROSS REQUEST STATE SECRET end

//GET REDIRECT AND POST ACCESS_TOKEN
function makeRedirect(path, params) {
  return path + '?' + Object.entries(params).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
}

async function fetchAccessToken(path, data) {
  return await fetch(path, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: Object.entries(data).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&')
  });
}

//GET REDIRECT AND POST ACCESS_TOKEN end

// const GOOGLE_CLIENTID = '595564072050-5t4i14ge3g0b7knrhn8an9pujha53m6q.apps.googleusercontent.com';
// const GOOGLE_CLIENTSECRET = '-GAqDZ67_FXh4189fYV-dSxi';
// const GOOGLE_CODE_LINK = 'https://oauth2.googleapis.com/token';
// const GOOGLE_REDIRECT_2 = 'https://auth-go-gi.2js-no.workers.dev/callback/google';
// const GOOGLE_REDIRECT_1 = 'https://accounts.google.com/o/oauth2/v2/auth';
//
// const GITHUB_ACCESS_TOKEN_LINK = 'https://github.com/login/oauth/access_token';
// const GITHUB_CLIENTID = '0c89d5ed6ca90c245bb6';
// const GITHUB_CLIENTSECRET = '1994dc316b43dc8a58e0cf8f027d93523ccaf85a';
// const GITHUB_OAUTH_LINK = 'https://github.com/login/oauth/authorize';
// const GITHUB_REDIRECT = 'https://auth-go-gi.2js-no.workers.dev/callback/github';

async function googleProcessTokenPackage(code) {
  const tokenPackage = await fetchAccessToken(
    GOOGLE_CODE_LINK, {
      code,
      client_id: GOOGLE_CLIENTID,
      client_secret: GOOGLE_CLIENTSECRET,
      redirect_uri: GOOGLE_REDIRECT_2,
      grant_type: 'authorization_code'
    }
  );
  const jwt = await tokenPackage.json();
  const [header, payloadB64url, signature] = jwt.id_token.split('.');
  const payloadText = atob(fromBase64url(payloadB64url));
  const payload = JSON.parse(payloadText);
  return payload.sub;
}

async function githubProcessTokenPackage(code, state) {
  const accessTokenPackage = await fetchAccessToken(GITHUB_ACCESS_TOKEN_LINK, {
    code,
    client_id: GITHUB_CLIENTID,
    client_secret: GITHUB_CLIENTSECRET,
    redirect_uri: GITHUB_REDIRECT,
    state
  });
  const data = await accessTokenPackage.text();
  const x = {};
  data.split('&').map(pair => pair.split('=')).forEach(([k, v]) => x[k] = v);
  const accessToken = x['access_token'];
  const user = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': 'token ' + accessToken,
      'User-Agent': '2js-no',
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  const userData = await user.json();
  return userData.id;
}

async function handleRequest(req) {
  const url = new URL(req.url);
  const [ignore, action, data] = url.pathname.split('/');
  if (action === 'login') {
    let redirect;
    if (data === 'github') {
      redirect = makeRedirect(
        GITHUB_OAUTH_LINK, {
          state: getStateSecret(STATE_SECRET_TTL_MS, STATE_SECRET_REGISTRY_LENGTH),
          client_id: GITHUB_CLIENTID,
          redirect_url: GITHUB_REDIRECT,
          scope: 'user',
        }
      );
    } else if (data === 'google') {
      redirect = makeRedirect(GOOGLE_REDIRECT_1, {
        state: getStateSecret(STATE_SECRET_TTL_MS, STATE_SECRET_REGISTRY_LENGTH),
        nonce: randomString(12),
        client_id: GOOGLE_CLIENTID,
        redirect_uri: GOOGLE_REDIRECT_2,
        scope: 'openid email',
        response_type: 'code',
      });
    } else
      return new Response('error1');
    return Response.redirect(redirect);
  }
  if (action === 'callback') {
    const state = url.searchParams.get('state');
    if (!hasStateSecretOnce(state))
      return new Response('Error 667: state timed out');

    const code = url.searchParams.get('code');

    let userText;
    if (data === 'google')
      userText = 'go' + await googleProcessTokenPackage(code); //the userText is the sub.
    else if (data === 'github')
      userText = 'gi' + await githubProcessTokenPackage(code, state); //userText is the github id nr.
    else
      return new Response('error2');
    return new Response(userText, {status: 201});
  }
  const mainpage = `hello sunshine GITHUB oauth28 <a href='/login/google'>login google</a> - - - <a href='/login/github'>login github</a>`;
  return new Response(mainpage, {headers: {'Content-Type': 'text/html'}});
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));
```
