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

async function getStateSecret(ttl) {
  const state = [Date.now(), ttl, uint8ToHexString(crypto.getRandomValues(new Uint8Array(8)))].join('.');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await encryptAESGCM(SECRET, iv, state);
  return uint8ToHexString(iv) + '.' + toBase64url(btoa(cipher));
}

async function checkStateSecret(data, password) {
  const [ivText, cipherB64url] = data.split('.');
  const iv = hexStringToUint8(ivText);
  const cipher = atob(fromBase64url(cipherB64url));
  const payload = await decryptAESGCM(password, iv, cipher);
  let [iat, ttl, someOtherState] = payload.split('.');
  iat = parseInt(iat);
  ttl = parseInt(ttl);
  const now = Date.now();
  const stillTimeToLive = now < iat + ttl;
  const notAFutureDream = iat < now;
  const isValid = stillTimeToLive && notAFutureDream;
  return {iat, ttl, someOtherState, now, stillTimeToLive, notAFutureDream, isValid};
}

async function handleRequest(req) {
  const url = new URL(req.url);
  const [ignore, action, data] = url.pathname.split('/');
  if (action === 'decrypt') {
    let {iat, ttl, someOtherState, now, stillTimeToLive, notAFutureDream, isValid} = await checkStateSecret(data, SECRET);
    return new Response(`iat: ${iat}; ttl: ${ttl}; extra state: ${someOtherState}; now: ${now}; now&lt;iat+ttl===${stillTimeToLive}; iat&lt;now===${notAFutureDream}; valid? ${isValid} <a href='/'>new state secret</a>`, header);
  }
  const stateSecret = await getStateSecret(STATE_SECRET_TTL);
  return new Response(`Your stateSecret is (ttl=5): ${stateSecret}. <a href='/decrypt/${stateSecret}'>Check secret</a>`, header);
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));