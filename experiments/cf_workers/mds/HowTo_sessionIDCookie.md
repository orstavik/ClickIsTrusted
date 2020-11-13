#  HowTo: make a sessionID cookie using Cloudflare workers

> We only need `Max-Age`, we do not need `Expires`. When `Max-Age` is set, it will always override `Expires` anyway.

```javascript
const addForgetmeSessionCookieHeader ={
  'Set-Cookie': "my-cookie=my-value; Secure; HttpOnly; SameSite=Strict; Max-Age=3600"//60sec*60min=1hour
}
const addRemembermeSessionCookieHeader ={
  'Set-Cookie': "my-cookie=my-value; Secure; HttpOnly; SameSite=Strict; Max-Age=2592000"//30*24*3600= 1 mnth
}
const deleteSessionCookieHeader ={
  'Set-Cookie': "my-cookie=my-value; Secure; HttpOnly; SameSite=Strict; Max-Age=0" }
```

A session is controlled by the server. Cookies are used to mark the browser in the eyes of the server. HTTP Cookies that are set in the response header from the server to the browser, and then returned from the browser to the server in the request header.

HTTP cookies enable cloudflare workers (the server) to store and receive state in the browser (the client). The cookie itself is a simple keyString=>valueString. The cookie has several other properties that control its expiration time and the access to the cookie from tabs/iframes in the browser loaded from other servers. RFC 6265 require the web browser to store from 50 cookies per domain with the size of each(including attributes) from 4096 bytes. Developers should expect that the browser and the user can delete cookies every time the browser is closed.

## SessionID cookie

> Session: a set of interactions between f.x. a user and an application that take place within a given timeframe.

HTTP cookies can manage a session that takes place between:
1. a cf worker (server app),
2. a user,
3. a (trusted) browser, and
4. an HTML/JS app in the browser.

When we use HTTP cookies to control a session between these four actors, we call it a sessionID cookie. A sessionID cookie is a secure cookie, and we will describe here how to secure them. This guide describes what the cloudflare worker should tell the browser in order to protect a user's data run from that cloudflare worker.

## Demo: Cf worker setting and getting secure sessionID cookie

```javascript
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
```

The demo worker has three handles: `/setCookie`, `/deleteCookie`, and everything else.
1. when the worker `setCookie`, it adds a `Set-Cookie` header to the response with a expiration date 1 day into the future. This is typically done when the user logs in.
2. when the worker `deleteCookie`, it adds a `Set-Cookie` header to the response with an expiration date set to *now*. This will remove the cookie from the browser, and is typically done when the user logs out.
3. all other requests to the worker, will simply make the cookie worker print out the content of the cookie it receives from the browser.    

## HowTo: secure a cookie? 

Cookie settings are set as attributes after the cookie name and value in the `Set-Cookie` header. Cookie attributes are `key=value` pairs separated by a `;`. To secure a cookie, the following properties MUST BE set:

1. `Secure`. The cookie will only be added when the browser and server uses `https`. Any cookie that is not `Secure` will be completely unsafe, and cannot be used to store any type of secret or private information. Keep cookies `Secure` by default. Browsers default: `Secure=false`.

2. `Httponly`. The cookie cannot be accessed from JS, not even by the scripts from the domain that issued the cookie. Browsers default: `HttpOnly=false`.

3. `SameSite=Strict`. The cookie will only be sent from the browser to the client when the script that sends the request is from the same domain. This means that scripts loaded from other sites cannot dispatch the registered cookie if they do a `fetch` for example. Browser default: `SameSite=Strict`.

4. `Domain=.example.com`. The cookie will only be sent from the browser when the request is made to a resource under the specified domain and all its subdomains. This ensures that the cookie is not dispatched to other servers. Super cookies with domains such as `.com` are disallowed. 

Note. It is not possible to set a cookie for domains that are two levels up, ie. if your worker runs from `my-worker.my-project.workers.dev`, you can only set `Domain=my-project.workers.dev`, if you try to set a cookie two levels up such as `Domain=workers.dev`, it will fail. This means that you can set cookies that affect the parent domain, sibling domains, and all subdomains therein, but not the super domains (`.com`) nor a grandparent domain (a domain two levels up). 

5. `Path=/my/path` is a path that limits the scope of the cookie. It consists of directory components, separated by the symbol `/`. A cookie is included in requests whose URI starts with the corresponding path components. If no attribute is set, the path is taken from the request URI.

## HowTo: RememberMe or ForgetMe or Rolling cookies?

To make the browser either forget the session when the browser window closes, or remember the user's login even while the browser is shut down, use the `Max-age` attributes on `Set-Cookie`. The value of `Max-Age` is a TTL number in seconds after last `Set-Cookie` directive in a response.

> `Expires` is an older alternative to `Max-Age`. It require a more complex Date UTC format value (`new Date().toUTCString()`), and is always overridden by `Max-Age` when both attributes are set.

1. **ForgetMe cookies**, aka. **session cookies**, are delete by the browser every time the full browser window with that cookie is closed by the user (closing a tab in a window is not enough to forget a session cookie). To create a **forgetMe** cookie simply do NOT  set neither `Max-Age` nor `Expires` attributes on the cookie.

2. **RememberMe cookies**, aka **permanent cookies**, are saved by the browser even when the browser closes that browser window. The browser deletes the cookie when the `Max-Age` is reached. To create a **rememberMe** cookie, set a `Max-age` several days into the future, for example 1 day or 30 days. If the browser has already set a rememberMe cookie, do not set the cookie again.

   **RememberMe cookies** should not last infinitely. If a **RememberMe** cookie is set up to last for 365 days, then if it leaks, a leaked cookie might be valid for many months. To avoid such problems, **rolling cookies** can be used.   

3. **Rolling cookies** is a particular type of RememberMe cookies. Rolling cookies create rolling sessions, a session whose TTL is automatically extended while the user is active. 

   To create a **rolling cookie**, the server/worker sets a 'medium' `Max-age`: for example 4 hours (a long lunch break) or 10days (a short holiday). While the user remains active, this timeframe is continuously pushed into the future every time the browser interacts with the server. This is achieved by the cloudflare worker *always* sending the browser an update cookie with an updated `Max-Age` attribute. The cloudflare worker must keep track internally to for example only update Rolling Cookie upto a rolling cookie `Max-Age`. This functionality the cloudflare worker must implement itself, there is no support for it in the HTTP cookie standard. (It is of course possible to only update the session once for example it is halfway spent: for example only give a new 4 hour session once the current rolling session has less than 2hours left on the clock. Such a simple check can dramatically reduce the network overhead needed to extend the rolling cookie on each interaction).

## HowTo: send cookies using `fetch`

The default value for `credentials` is `"same-origin"`. The default for `credentials` wasn't always the same, though. The following versions of browsers implemented an older version of the `fetch` specification where the default was `'omit'`:

 * Firefox 39-60
 * Chrome 42-67
 * Safari 10.1-11.1.2

If you target these browsers, it's advisable to always specify `credentials: 'same-origin'` explicitly with all fetch requests instead of relying on the default:

```javascript
fetch('/users', {
  credentials: 'same-origin'
});
```

## Do user's logout?

You can't rely on users logging out for security: others might come in and use their account when they leave the computer at the library. But, you need to provide users with an active choice of logging out of an app, so that they might switch between user accounts for example. And the default option is to have a session cookie, not save credentials on a strange machine.

[good discussion](https://ux.stackexchange.com/questions/57132/do-users-log-out)

### References 

* [Sessions and Cookies](https://auth0.com/docs/sessions-and-cookies)
* [MDN: Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
* [RFC 6265](https://tools.ietf.org/html/rfc6265#section-4.1)
* [Blog: "Just how many web users really disable cookies or JavaScript?"](https://blog.yell.com/2016/04/just-many-web-users-disable-cookies-javascript/)
* [sending cookies using fetch](https://github.com/github/fetch#user-content-handling-http-error-statuses:~:text=)-,Sending%20cookies,Note%3A%20due%20to%20limitations%20of%20XMLHttpRequest%2C%20using%20credentials%3A%20'omit'%20is%20not%20respected%20for%20same%20domains%20in%20browsers%20where%20this%20polyfill%20is%20active.%20Cookies%20will%20always%20be%20sent%20to%20same%20domains%20in%20older%20browsers.,-Receiving%20cookies)
