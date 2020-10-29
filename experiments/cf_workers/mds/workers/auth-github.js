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

const states = [];

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
    const state = randomString(12);
    states.push(state);
    return Response.redirect(makeRedirect(
      GITHUB_OAUTH_LINK, {
        state,
        client_id: GITHUB_CLIENTID,
        redirect_url: GITHUB_REDIRECT,
        scope: 'user',
      }
    ));
  }
  if (action === 'fromGithub') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (states.indexOf(state) === -1)
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