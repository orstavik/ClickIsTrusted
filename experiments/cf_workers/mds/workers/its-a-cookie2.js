function html(txt) {
  return `
<h1>${txt}</h1><br>
<a href="/logoutCookie">logoutCookie</a><br>
<a href="/forgetMeCookie">forgetMeCookie</a><br>
<a href="/rememberMeCookie">rememberMeCookie</a><br>
<a href="/rollingCookie">rollingCookie</a><br>
<a href="/${Math.random()}">hello sunshine</a><br>`;
}

const secureCookieSettings = {
  Domain: '2js-no.workers.dev',
  Secure: true,
  HttpOnly: true,
  SameSite: 'Strict'
};    //remember, NO support for HTTP TRACE from your server!!!

function getCookieValue(cookie, key) {
  return cookie?.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`)?.pop();
}

function cookieToStr(cookie) {
  return Object.entries(cookie).map(([k, v]) => k + '=' + v).join('; ');
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const [ignore, action] = url.pathname.split('/');

  //setting normal cookie
  const cookie =
    action === 'logoutCookie' ? {iat: Date.now(), 'Max-Age': 0} :
      action === 'forgetMeCookie' ? {iat: Date.now()} :
        action === 'rememberMeCookie' ? {iat: Date.now(), 'Max-Age': 60 * 1} :
          undefined;
  if (cookie) {
    const fullCookie = cookieToStr(Object.assign(cookie, secureCookieSettings));
    return new Response(html(action + ' cookie: ' + fullCookie), {
      status: 201,
      headers: {'Content-type': 'text/html', 'Set-Cookie': fullCookie}
    });
  }

  //setting rolling cookie
  const cookies = request.headers.get('cookie');
  const iatString = getCookieValue(cookies, 'iat');
  const [iatDate, maybeRoll] = iatString?.split('.') || [];
  const iat = new Date(parseInt(iatDate || Date.now()));
  const roll = maybeRoll === 'roll';
  if (roll || action === 'rollingCookie') {
    const cookie = {iat: Date.now() + '.roll', 'Max-Age': 60 * 1};
    const fullCookie = cookieToStr(Object.assign(cookie, secureCookieSettings));
    return new Response(html('rolling cookie: ' + iat.toUTCString() + fullCookie), {
      status: 201,
      headers: {'Content-type': 'text/html', 'Set-Cookie': fullCookie}
    });
  }
  return new Response(html('hello cookie: ' + iat.toUTCString()), {
    status: 201,
    headers: {'Content-type': 'text/html'}
  });
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));