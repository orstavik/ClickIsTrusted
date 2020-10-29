const GITHUB_CLIENTID = '0c89d5ed6ca90c245bb6';
const GITHUB_CLIENTSECRET = '1994dc316b43dc8a58e0cf8f027d93523ccaf85a';
const GITHUB_REDIRECT = 'https://its-auth-github.2js-no.workers.dev/fromGithub';
const GITHUB_OAUTH_LINK = 'https://github.com/login/oauth/authorize';
const GITHUB_ACCESS_TOKEN_LINK = 'https://github.com/login/oauth/access_token';

//todo here we should encrypt a timestamp, and then we can verify that this timestamp is still valid.
function randomString(length) {
  const iv = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

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

//CROSS REQUEST STATE SECRET
const STATE_SECRET_TTL_MS = 3 * 60 * 1000;
const STATE_SECRET_REGISTRY_LENGTH = 10000; //10000 = 24 000kb max size.
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

async function githubProcessTokenPackage(accessTokenPackage) {
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
  return userData.id + userData.login;
}

async function handleRequest(req) {
  const url = new URL(req.url);
  const [ignore, action, data] = url.pathname.split('/');
  if (action === 'mainpage') {
    return new Response('mainpage, logoutlink, loginlink');
  }
  if (action === 'login') {
    return Response.redirect(makeRedirect(
      GITHUB_OAUTH_LINK, {
        state: getStateSecret(STATE_SECRET_TTL_MS, STATE_SECRET_REGISTRY_LENGTH),
        client_id: GITHUB_CLIENTID,
        redirect_url: GITHUB_REDIRECT,
        scope: 'user',
      }
    ));
  }
  if (action === 'fromGithub') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!hasStateSecretOnce(state))
      return new Response('Error 667: state timed out');
    const accessTokenPackage = await fetchAccessToken(GITHUB_ACCESS_TOKEN_LINK, {
      code,
      client_id: GITHUB_CLIENTID,
      client_secret: GITHUB_CLIENTSECRET,
      redirect_uri: GITHUB_REDIRECT,
      state
    });
    const userText = await githubProcessTokenPackage(accessTokenPackage);
    return new Response(userText, {status: 201});
  }
  return new Response('hello sunshine GITHUB oauth20');
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));