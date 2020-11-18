# HowTo: use encryption to create server-browser sessions? 

The general concept of a 'session' is a state that is remembered by both the browser and the server over several http messages.

The simplest way to remember such a state, is to use a cookie. The cookie is stored by the browser, and then included in every transaction from the browser to the server. As long as the server stays passive (ie. does not need to push messages and therefore need some kind of web socket), the cookie works well as a session store.

## Why add encryption?

The problem with cookies, is that they are saved by the browser. And the browser is unsafe, someone might read the content of cookies without the browser owner knowing about it. And if someone can read the cookie in the browser memory, they can a) steal it, and b) use the information in that cookie to create their own fake cookies to hack the server system.
  
Thus, two things need to happen:
1. The information inside the cookie must be encrypted so that any attacker that reads a cookie in the browser memory can make new fake cookies with the same format to hack the system.

2. The cookies must have a timestamp so that if someone gets a hold of a cookie, he/she cannot use that cookie for too long.

So. The server can save state between different http messages with the same browser/user by:
   1. Take the state information the server needs to remember until next time.
   2. Add a timestamp to this information.
   3. Encrypt this information.
   4. Put the encrypted information in a cookie or a redirect parameter.
   5. when receving a redirect or another http request, look for the redirect parameter or the cookie.
   6. decrypt this information and check the timestamp.
   7. use the same state information that it had from the previous session.

## Authentication and sessions.

There are two times during authentication that we needto store state:
 * state parameter and
 * sessionID cookie.   

### Benefits/drawbacks with encrypting state in sessions

Encryption is:
1. super fast (<1ms) and takes no memory resources,
2. require no db operations, which usually costs money, and
3. doesn't save user data on the server, thus more readily complies with GPRS.

Drawbacks of encryption are:
1. more data in HTTP packets (big cookie or big redirect parameter),
2. encryption secret can be mined out from several HTTP packets, and is thus open for another type of attack, and
3. more complex code in the encryption layer.

## Demo:

1.  we have a worker that redirects to itself with a state parameter with encrypted data

```
1. browser => GET my.worker.dev/ => worker
2. worker makes a state param, with ttl, iat, passphrase and encrypts it with SECRET
3. browser <= REDIRECT: my.worker.dev/?state=abc123 <= worker
4. browser => GET my.worker.dev/?state=abc123 => worker
5. worker decrypts the state param with the same SECRET, checks the ttl, iat, and passphrase

6. creates a new sessionID object with iat, ttl, userId (which is just a fixed value like 'Max')
7. sets this sessionID as a cookie
8. browser <= 200: my.worker.dev/ with SESSIONID cookie <= worker
9. browser => GET my.worker.dev/showCookie => worker
10. worker decrypts the cookie coming with the http request, using the same SECRET, checks the ttl, iat, and finds the userID.
11. browser <= 200: my.worker.dev/showCookie with the value of the userId <= worker
```

## Demo code:

```javascript
let SECRET = "klasjdfoqjpwoekfj!askdfj"
const ROOT = "TODO.TODO.workers.dev"; //TODO
const STATE_PARAM_TTL = 3*60;
const SESSION_TTL = 60*60*24*7;
let cachedPassHash;


//imported pure functions begins
function getCookieValue(cookie, key) {
  return cookie ?.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`) ?.pop();
}

function uint8ToHexString(ar) {
  return Array.from(ar).map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

function hexStringToUint8(str) {
  return new Uint8Array(str.match(/.{2}/g).map(byte => parseInt(byte, 16)));
}

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

async function passHash(pw) {
  return cachedPassHash || (cachedPassHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw)));
}

async function makeKeyAESGCM(password, iv) {
  const pwHash = await passHash(password);
  const alg = { name: 'AES-GCM', iv: iv };                            // specify algorithm to use
  return await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt', 'encrypt']);  // use pw to generate key
}

async function encryptAESGCM(password, iv, plaintext) {
  const key = await makeKeyAESGCM(password, iv);
  const ptUint8 = new TextEncoder().encode(plaintext);                               // encode plaintext as UTF-8
  const ctBuffer = await crypto.subtle.encrypt({ name: key.algorithm.name, iv: iv }, key, ptUint8);                   // encrypt plaintext using key
  const ctArray = Array.from(new Uint8Array(ctBuffer));                              // ciphertext as byte array
  return ctArray.map(byte => String.fromCharCode(byte)).join('');             // ciphertext as string
}

async function decryptAESGCM(password, iv, ctStr) {
  const key = await makeKeyAESGCM(password, iv);
  const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0))); // ciphertext as Uint8Array
  const plainBuffer = await crypto.subtle.decrypt({ name: key.algorithm.name, iv: iv }, key, ctUint8);                 // decrypt ciphertext using key
  return new TextDecoder().decode(plainBuffer);                                       // return the plaintext
}

async function encryptData(data) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await encryptAESGCM(SECRET, iv, data);
  return uint8ToHexString(iv) + '.' + toBase64url(btoa(cipher));
}

async function decryptData(data, password) {
  const [ivText, cipherB64url] = data.split('.');
  const iv = hexStringToUint8(ivText);
  const cipher = atob(fromBase64url(cipherB64url));
  const payload = await decryptAESGCM(password, iv, cipher);
  let [iat, ttl, someOtherState] = payload.split('.');
  return [iat, ttl];
}
//imported pure functions ends

//max. the getState(ttl) and checkData(iat, ttl) functions are application specific, don't mix them in with the list of pure functions.
function getState(ttl) {
  return [Date.now(), ttl, uint8ToHexString(crypto.getRandomValues(new Uint8Array(8)))].join('.');
}

function checkTTL(iat, ttl) {
  const now = Date.now();
  const stillTimeToLive = now < iat + ttl;
  const notAFutureDream = iat < now;
  return stillTimeToLive && notAFutureDream;
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const [ignore, action] = url.pathname.split('/');
  const stateParam = url.searchParams.get('state');
  if(!action && !stateParam){
    //1. first time
    //2. worker makes a state param, with ttl, iat, passphrase and encrypts it with SECRET
    const state = getState(STATE_PARAM_TTL);
    const encryptedState = await encryptData(state);
    const redirectUrl = "https://" + ROOT + "/?state=" + encodeURIComponent(encryptedState);
    //3. browser <= REDIRECT: my.worker.dev/?state=.... <= worker
    return Response.redirect(redirectUrl);
  }
  //4. browser => GET my.worker.dev/?state=... => worker
  if (!action && stateParam) {
    // 5. worker decrypts the state param with the same SECRET, checks the ttl, iat, and passphrase
    let [_iat, _ttl] = await decryptData(stateParam, SECRET); // return decrypted value.
    if (!checkTTL(_iat, _ttl))
      return new Response("Error: state param timed out");
    // 6. creates a new sessionID object with iat, ttl, userId (which is just a fixed value like 'Max')
    let sessionID = JSON.stringify({ iat: Date.now(), ttl: SESSION_TTL, uid: "Max" });
    let encryptedSessionID = await encryptData(sessionID);
    return new Response(`<a href="/showCookie">get cookies</a>`, {
      status: 200,
      headers: {
        'content-type': 'text/html',
        // 7. sets this sessionID as a cookie
        'Set-Cookie': `SESSIONID=${encryptedSessionID}; HttpOnly; Secure; SameSite=Strict; Path=/; Domain=${ROOT};`
      }
    });
  }
  //9. browser => GET my.worker.dev/showCookie => worker
  if (action === "showCookie") {
    const cookie = getCookieValue(request.headers.get('cookie'), 'SESSIONID');
    if (cookie) {
      // 10. worker decrypts the cookie coming with the http request, using the same SECRET, checks the ttl, iat, and finds the uid.
      let [cookieData, ignore] = await decryptData(cookie, SECRET);
      let cookieDataObj = JSON.parse(cookieData);
      if (!checkTTL(cookieDataObj.iat, cookieDataObj.ttl))
        return new Response("Error: session timed out");
      //11. browser <= 200: my.worker.dev/showCookie with the value of the userId <= worker
      return new Response(cookieDataObj.uid);
    }
    return new Response("no cookie! :(");
  }

  //3. browser <= REDIRECT: my.worker.dev/?state=.... <= worker
  return Response.redirect(redirectUrl);
}

addEventListener('fetch', e =>e.respondWith(handleRequest(e.request)));
```