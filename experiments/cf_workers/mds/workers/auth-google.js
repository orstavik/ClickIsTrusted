//https://developers.google.com/identity/protocols/oauth2/openid-connect

const GOOGLE_CLIENTID = '595564072050-5t4i14ge3g0b7knrhn8an9pujha53m6q.apps.googleusercontent.com';
const GOOGLE_CLIENTSECRET = '-GAqDZ67_FXh4189fYV-dSxi';
const GOOGLE_REDIRECT_2 = 'https://goauth2.2js-no.workers.dev/fromGoogle';
const GOOGLE_REDIRECT_1 = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_CODE_LINK = 'https://oauth2.googleapis.com/token';

function randomString(length) {
  const iv = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

//CROSS REQUEST STATE SECRET
const STATE_SECRET_TTL_MS = 3 * 60 * 1000;
const STATE_SECRET_REGISTRY_LENGTH = 10000; //10000 = 24 000kb max size.
const states = [];               //i don't have a clean up method for the registry length.

function getStateSecret(ttl, stateRegistrySize) {
  //1. the secret is a hexString of a random number
  const secret = randomString(12);

  //2. states is an LRU cache
  states.length > (stateRegistrySize) && states.shift();
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

async function processGoogleTokenPackage(tokenPackage) {
  const jwtString = await tokenPackage.json();
  return jwtString.id_token;
  //todo unwrap JWT token
}

async function handleRequest(req) {
  const url = new URL(req.url);
  const [ignore, action, data] = url.pathname.split('/');
  if (action === 'mainpage') {
    return new Response('mainpage, logoutlink, loginlink');
  }
  if (action === 'login') {
    return Response.redirect(makeRedirect(GOOGLE_REDIRECT_1, {
      state: getStateSecret(STATE_SECRET_TTL_MS, STATE_SECRET_REGISTRY_LENGTH),
      nonce: randomString(12),
      client_id: GOOGLE_CLIENTID,
      redirect_uri: GOOGLE_REDIRECT_2,
      scope: 'openid email',
      response_type: 'code',
    }));
  }
  if (action === 'fromGoogle') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!hasStateSecretOnce(state))
      return new Response('state is lost');

    const tokenPackage = await fetchAccessToken(
      GOOGLE_CODE_LINK, {
        code,
        client_id: GOOGLE_CLIENTID,
        client_secret: GOOGLE_CLIENTSECRET,
        redirect_uri: GOOGLE_REDIRECT_2,
        grant_type: 'authorization_code'
      }
    );
    const body = await processGoogleTokenPackage(tokenPackage);
    return new Response(body, {status: 201});
  }
  return new Response('hello sunshine google oauth106');
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));