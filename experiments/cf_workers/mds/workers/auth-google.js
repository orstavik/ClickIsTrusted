//https://developers.google.com/identity/protocols/oauth2/openid-connect

const GOOGLE_CLIENTID = '595564072050-5t4i14ge3g0b7knrhn8an9pujha53m6q.apps.googleusercontent.com';
const GOOGLE_CLIENTSECRET = '-GAqDZ67_FXh4189fYV-dSxi';
const GOOGLE_REDIRECT_2 = 'https://goauth2.2js-no.workers.dev/fromGoogle';
const GOOGLE_REDIRECT_1 = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_CODE_LINK = 'https://oauth2.googleapis.com/token';

//todo here we should encrypt a timestamp, and then we can verify that this timestamp is still valid.
function randomString(length) {
  const iv = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

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

const states = [];

async function handleRequest(req) {
  const url = new URL(req.url);
  const [ignore, action, data] = url.pathname.split('/');
  if (action === 'mainpage') {
    return new Response('mainpage, logutlink, loginlink');
  }
  if (action === 'login') {
    const state = randomString(12);
    states.push(state);
    return Response.redirect(makeRedirect(GOOGLE_REDIRECT_1, {
      state,
      client_id: GOOGLE_CLIENTID,
      redirect_uri: GOOGLE_REDIRECT_2,
      nonce: randomString(12),
      scope: 'openid email',
      response_type: 'code',
    }));
  }
  if (action === 'fromGoogle') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (states.indexOf(state) === -1)
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

    const jwtString = await tokenPackage.json();

    return new Response(JSON.stringify(jwtString), {status: 201});
  }
  return new Response('hello sunshine google oauth106');
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));