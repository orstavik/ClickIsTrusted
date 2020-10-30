#  HowTo: handle cross-request state in CF workers? 

## Why and when?

There are many instances when you would like to save state across different requests to a cloudflare worker:
1. You would like to save data to a user for all times. This is typically a database problem, which you would solve with Cloudflare KV store.
2. You would like to save data to a particular browser. This is typically a session problem, and you would most likely solve this with a cookie or a parameter in the url.
3. You would like to cache things the worker create in order to speed up response time. This is likely a cache problem or a worker variable problem.

The example usecase here is to make a secret state parameter for use with oauth sign-in. 

## the KV.

The KV is simple:
1. register a KV in the KV table overview of cloudflare.
2. register a variable KV_SomeName to the KV table in the KV instances variables in the particular workers settings.
3. call KV_SomeName.get, KV_SomeName.put, KV_SomeName.list to put data into the KV table and get data out of the KV table.

### Plus/minus for uses with KV when applied to secret state parameter for SSO.

The drawbacks of the KV approach is:
1. it require 1 write and 1 read ops from the kv store. This costs a little bit money when scaled up.
2. each operation to and from the kv store takes around 25ms.

The benefit of the KV approach is:
1. the data transferred between the server app and its browser clients can be made simpler and smaller. 

## The session.

To store data pertaining to a particular browser, use the header set-cookie when sending a response, and then read the cookie property from the cookie header in the request.

Cookies get interesting when they are secret! If we encrypt the data in the cookie or the url parameter, we can use the decryption process to verify that the cookie was 1) made by the server and has not been tampered with and 2) read its content.

### Plus/minus for uses with encryption when applied to secret state parameter for SSO.

The benefit of the encryption approach is:
1. it requires no costly operations against db. Nor any other operations outside the scope of the worker. It is free.
2. It is super fast (<1ms) and takes no memory resources.

The drawback of the encryption approach is:
1. data transferred between the server app and its browser clients is bigger.
2. data transferred between the server app and the browsers can be used to mine out a valid keyphrase.
3. more complexity in the encryption layer. Although most of the methods can be made simpler, there is still an overhead for the developer mind.

* It seems clear that in an app that already manages encryption, the encryption approach is dramatically better in a cloudflare worker context. 

```javascript
// PASSWORD HASH SHA-256
//   A cached hashing of the password which is reused multiple times.
//   turns short strings with length 5 and long strings with length 500 into hash strings always 256 long.
//   This function is needed by both the worker that encrypts and decrypts the message.
let cachedPassHash;

async function passHash(pw) {
  return cachedPassHash || (cachedPassHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw)));
}

// PASSWORD HASH SHA-256 ends


// LRU (least recently used) cache
// implemented as two pure functions.
// relies on the keys of normal js objects being sorted insertion order, to ensure safe ordering, use Map instead.
//
// EXAMPLE:
//    const myCache = {};
//    const MAX = 1000;
//    ...
//    const value = await (getLRU(myCache, key) || setLRU(myCache, key, asyncFunction(key, maybeOtherData), max));
const cache = {};
const KEYCACHE_SIZE = 1000;

function getLRU(key) {
  const value = cache[key];
  if (!value)
    return undefined;
  delete cache[key];
  return cache[key] = value;
}

function setLRU(key, value) {
  const keys = Object.keys(cache);
  keys.length >= KEYCACHE_SIZE && delete cache[keys[0]];
  return cache[key] = value;
}

//LRU ends


//base64url
//EXAMPLE:
//  const b64ulr = toBase64url(btoa(aStr));
//  const str = atob(fromBase64url(b64url));
//ATT!! notice how the  btoa and atob are respectively inside and then outside the base64url functions.
function toBase64url(base64str) {
  return base64str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64url(base64urlStr) {
  base64urlStr = base64urlStr.replace(/-/g, '+').replace(/_/g, '/');
  if (base64urlStr.length % 4 === 2)
    base64urlStr += '==';
  else if (base64urlStr.length % 4 === 3)
    base64urlStr += '=';
  return base64urlStr;
}

//base64url ends

//uint8ToHexString, and vice versa
function uint8ToHexString(ar) {
  return Array.from(ar).map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

function hexStringToUint8(str) {
  return new Uint8Array(str.match(/.{2}/g).map(byte => parseInt(byte, 16)));
}

//uint8ToHexString ends

//makeKey.
// create a key object based on a string-formatted 12byte iv, or from scratch.
async function makeKeyAESGCM(password, iv) {
  const pwHash = await passHash(password);
  const alg = {name: 'AES-GCM', iv: iv};                            // specify algorithm to use
  return await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt', 'encrypt']);  // use pw to generate key
}

//makeKey end

//ENCRYPT & DECRYPT
async function encryptAESGCM(password, iv, plaintext) {
  const key = await makeKeyAESGCM(password, iv);
  const ptUint8 = new TextEncoder().encode(plaintext);                               // encode plaintext as UTF-8
  const ctBuffer = await crypto.subtle.encrypt({name: key.algorithm.name, iv: iv}, key, ptUint8);                   // encrypt plaintext using key
  const ctArray = Array.from(new Uint8Array(ctBuffer));                              // ciphertext as byte array
  return ctArray.map(byte => String.fromCharCode(byte)).join('');             // ciphertext as string
}

async function decryptAESGCM(password, iv, ctStr) {
  const key = await makeKeyAESGCM(password, iv);
  const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0))); // ciphertext as Uint8Array
  const plainBuffer = await crypto.subtle.decrypt({name: key.algorithm.name, iv: iv}, key, ctUint8);                 // decrypt ciphertext using key
  return new TextDecoder().decode(plainBuffer);                                       // return the plaintext
}

//ENCRYPT & DECRYPT end

const SECRET = 'klasjdfoqjpwoekfj!askdfj';
const STATE_SECRET_TTL = 5 * 1000;  //5sec is simpler to test.
const header = {status: 201, headers: {'content-type': 'text/html'}};

async function handleRequest(req) {
  const url = new URL(req.url);
  const [ignore, action, data] = url.pathname.split('/');
  if (action === 'decrypt') {
    const [ivText, cipherB64url] = data.split('.');
    const iv = hexStringToUint8(ivText);
    const cipher = atob(fromBase64url(cipherB64url));
    const payload = await decryptAESGCM(SECRET, iv, cipher);
    let [iat, ttl, someOtherState] = payload.split('.');
    iat = parseInt(iat);
    ttl = parseInt(ttl);
    const now = Date.now();
    return new Response(`iat: ${iat}; ttl: ${ttl}; extra state: ${someOtherState}; now: ${now}; now&lt;iat+ttl===${now < iat + ttl}; iat&lt;now===${iat < now}; <a href='/'>new state secret</a>`, header);
  }
  const state = [Date.now(), STATE_SECRET_TTL, uint8ToHexString(crypto.getRandomValues(new Uint8Array(8)))].join('.');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await encryptAESGCM(SECRET, iv, state);
  const stateSecret = uint8ToHexString(iv) + '.' + toBase64url(btoa(cipher));
  return new Response(`Here is your 666 stateSecret: ${stateSecret}. <a href='/decrypt/${stateSecret}'>Check secret</a>`, header);
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));
```  

## The *worker variables*.

In this great discussion, it shows how cf can quickly route many requests to different worker instances. [https://community.cloudflare.com/t/workers-global-variables/121123](https://community.cloudflare.com/t/workers-global-variables/121123)

If you run this one test in bash:

```
bash$ for i in {1..15}; do curl https://121123.judge.workers.dev; done

=> 121111211111121
```