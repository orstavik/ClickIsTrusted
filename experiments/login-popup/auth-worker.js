
//Logging in creates a session_key and then register an id_token under it.
//
//Using the session key, you would get an id_token. The id_token contains the 'sub' used as key to store user data.
//session => id_token.sub => user data.
//
//Logging out removes a session key from the datastore before its time.
//Pt. you cannot logout all users with one command as per now.
//
// ## User:Session is 1:n
//  1. It is normal for a user to log multiple browsers at the same time. On the same machine or not, doesn't matter.
//  2. This means that 1 user can have many active sessions at the same time: user:sessions = 1:n.

const MAIN_DOMAIN = '';
const GOOGLE_JWT_LINK = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_CLIENT_ID = '';
const GOOGLE_CLIENT_SECRET = '';
const GOOGLE_REDIRECT_URI = '';

async function getIdToken(link, data) {
  const formFitData = new FormData();
  for (let [key, value] of Object.entries(data))
    formFitData.append(key, value);

  const jwt = await fetch(link, {
    method: 'POST',
    // type: 'application/x-www-form-urlencoded', //todo do i need this?
    body: formFitData
  });
  const jsonTokens = await jwt.json();
  const id_token = jsonTokens.sub;
  id_token.sub = 'google|' + id_token.sub;
  return id_token;
}

async function getGoogleIdToken(code) {
  return await getIdToken(GOOGLE_JWT_LINK, {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  });
}

async function makeSessionKey(id_token) {
  return id_token + '.' + new Date().getTime();
}

async function handleRequest(req) {
  const url = new URL(req.url);
  const state = url.searchParams.get('state'); //todo do we really simply ignore this??
  const code = url.searchParams.get('code');
  try {
    let id_token;
    if (url.pathname.beginsWith('/google'))
      id_token = await getGoogleIdToken(code);
    // else if(url.pathname.beginsWith('/github'))
    //   id_token = await getGithubIdToken(code);
    const session = await makeSessionKey(id_token);
    return new Response(
      `<script>window.opener.postMessage('login-2js-no', ${MAIN_DOMAIN});window.close();</script>`, {
        status: 201,
        headers: {
          'Set-Cookie': `userid_2js.no=${session} domain=2js.no secure httpOnly expiration-date ;`//todo
        }
      });
  } catch (err) {
    return new Response('', {status: 401});
  }
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));