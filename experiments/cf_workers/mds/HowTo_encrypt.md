#  HowTo: make a sessionID cookie using Cloudflare workers

## Why: AES-GCM?

1. We want a native, web crypto solution. Having an algorithm that can be triggered using a native library will be a) much more efficient, b) much faster, and c) much less complex.

2. Of the native algorithms supported in V8, there are only four that supports encryption: RSA-OAEP, AES-CTR, AES-CBC, and AES-GCM. We need a synchronic algorithm, and then there are only three alternatives: AES-CTR, AES-CBC, and AES-GCM.

3. The AES-GCM is the only one of these three algorithms that support checking both authenticity and integrity. Put simply, the GCM mode of AES include a checksum check within the algorithm itself that not only ensures that the encrypted message is secret, but also that it cannot be slightly altered. With AES-GCM, a checksum is included, which is nice.

This means that AES-GCM is 1) the only native web crypto API algorithm for 2) synchronic encryption/decryption that 3) bake in checksum checking.   

## HowTo: HASH SHA-256? 

HASH SHA-256 is a hashing algorithm that creates a random number/string given different strings. The hash algorithm always returns the same output for the same input, but you cannot recreate the input from the output (without serious, timeconsuming and costly effort). It is a one way function.

The HASH SHA-256 always return a 256 string, even if the input is much smaller than 256 chars or much larger than 256 chars.

The HASH SHA-256 takes a little time to run. Therefore, if we need to run the same HASH SHA-256 method for the same input string, it is smart to cache the output. This is how we accomplish both using JS and its native web crypto.

```javascript
let cachedPassHash;

async function passHash(pw) {
  return cachedPassHash || (cachedPassHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw)));
}

//converts the array buffer into a hex string 
function bufferToString(hash1) {
  const array1 = new Uint8Array(hash1);
  return Array.from(array1).map(b => ('00' + b.toString(16)).slice(-2)).join(''); 
}
```

Demo of the hash SHA256 function.

```javascript
(async function(){
  const test1 = 'hello sunshine';
  const test2 = 'abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--abcdefghijklmnopqrstuvwxyz--';
  const hash1 = await passHash(test1);
  console.log(bufferToString(hash1));
  //eb3a071bc7afc696b5691305264d369dcfa845f0a404a273994755a512859683
  cachedPassHash = undefined;
  const hash1b = await passHash(test1);
  console.log(bufferToString(hash1b));
  //eb3a071bc7afc696b5691305264d369dcfa845f0a404a273994755a512859683
  cachedPassHash = undefined;
  const hash2 = await passHash(test2);
  console.log(bufferToString(hash2));
  //a9ecf8830d0cc28e445345890393a7e4c301a48c98db8c4114f3cf7c80509d25
  cachedPassHash = undefined;
  const hash2b = await passHash(test2);
  console.log(bufferToString(hash2b));
  //a9ecf8830d0cc28e445345890393a7e4c301a48c98db8c4114f3cf7c80509d25
})();
```

## HowTo: base64url

base64 is a handy format for taking binary text strings and encoding them into a smaller text format safe to be transported and positioned elsewhere. But. It turns out that base64 is not 100% safe either. It turns out that base64 is using `+` and `/` and `=` which are not safe to be used in urls. Therefore, we would like to convert base64 into an even safer text format: base64url.

base64url is the same as base64, except that +=>-, /=>_, and trailing = and == are removed. Yes. It is that simple.

```javascript
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
```

There are two things to make note of:
1. there is not really a need to include the padding `=` at the end of base64 strings. The need to have padding can be calculated based on the length of the base64 string. Therefore, base64url simply removes the `=` at the end of the base64 strings, and then reapply them based on the length of the base64url string.
2.  when converting a 'normal' string into base64url (via base64), the base64 function is applied *BEFORE* the base64url when the string is encoded, and *AFTER* the base64url function when the string is decoded.
 
```javascript
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

const str = 'hello sunshine!?#~<>*!';
console.log(str);                       
const b64 = btoa(str);
console.log(b64);
const b64url = toBase64url(b64); 
console.log(b64url);
const b642 = fromBase64url(b64url)      
console.log(b642);
const str2 = atob(fromBase64url(b642)); 
console.log(str2);
// hello sunshine!?#~<>*!
// aGVsbG8gc3Vuc2hpbmUhPyN+PD4qIQ==
// aGVsbG8gc3Vuc2hpbmUhPyN-PD4qIQ
// aGVsbG8gc3Vuc2hpbmUhPyN+PD4qIQ==
// hello sunshine!?#~<>*! 
```

## HowTo: make an IV (initial vector)?

IV stands for "initial vector", and functions as a 'second secret' to the AES-GCM encryption algorithm.

1. The normal password is a **universal** secret: it is the same for all secret for all encrypted messages. The normal password is **SUPER SECRET**, it must never be shared.
2. The IV password is a **unique** secret: it should be different for all encrypted messages. The IV password primary purpose is to make it difficult for attackers to analyze a set of multiple encrypted messages in order to mine out the *normal password*. By using a random input for each message, the resulting cipher text becomes even more scrambled and even harder to use to find the original secret needed to make fake cipher texts or encrypt secret cipher messages. But! The IV password doesn't need to be secret, in fact it can be distributed with the encrypted messages. Sure, if you want extra security, you would try to keep the IV secret too, but even when the IV password is distributed with the encrypted message, the encryption and the normal, secret password remains safe.

The IV passwords should be different from each other: two messages should not be encrypted with the same IV. If an attacker has several messages with the same IV, it is simpler for him/her to analyze the group of encrypted messages that uses the same IV to mine out the normal, universal secret. How much simpler you ask, well that I don't know.

To keep IV different (enough), the IV is a random list of 12 Uint8 (one byte unsigned integers, ie. numbers from 0 to 255). To generate such a list is simple enough: `crypto.getRandomValues(new Uint8Array(12));`.

### Why use IV, and not just the message? as the random input

Why do we need the IV at all, why can't we just use for example the start of the message? Or some kind of hash of the message? Isn't that random input enough?

If we for example just used the first 12 chars of the input message, then we might think of them as different, but the might not be. First, only 26chars of the english alphabet might be represented, and that is not 256. Second, the messages might be wrapped the same way, such as all being JSON tokens: `{ alg: 'AES-GCM', ...`. So, using the first twelve chars in the message as the source of a random IV would not work.

But how about using a hash of the message, such as SHA256? The main problem with the hash is that it would make it difficult to decrypt the message. I think. That looking at the message, holding the universal secret in one hand, the AES-GCM algorithm wouldn't be able to figure out the random IV from the ciphertext.

Thus. A random IV must be made for each encryption, to ensure that the variable input of the AES-GCM algorithm is always varied enough, and then that IV vector must then be made available to the decryption process, so that it has all the passwords needed to decrypt the message. This hides the universal secret from being mined out from crypto analysis.

### HowTo: convert IV to and from string?

As we need to share the IV with the encrypted message, we need to convert this list of numbers into characters that are safe to pass over the internet: ie. base64url. To convert an array of 12 numbers into a base64url, and back again, we do like this:
```javascript
function uint8ToHexString(ar){
  return Array.from(ar).map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

function hexStringToUint8(str){
  return new Uint8Array(str.match(/.{2}/g).map(byte => parseInt(byte, 16)));
}
```   

## LRU cache

**Least Recently Used** cache is a simple method of only remembering entities that are currently in use. A cache is useful when we need to avoid doing heaving computation of pure functions again and again, when the function receives the same input data. Using AES-GCM, if the same message is being decrypted again and again, and the cache is safe in the memory of the running app, then a LRU cache can be an excellent alternative to avoid performing superfluous decryption processes that cost the runtime environment upto 1 ms per execution.

This implementation is based on the simple native JS `Object`. This assumes that the keys in the `Object` will be sorted *insertion order*, and that this will not change. Currently, V8 works in this way. As do all other JS runtime environments that I know of. But, the JS spec does not guarantee this behavior. We do this still, instead of using a `Map`, because for V8 to change this behavior would a great many existing applications to break in very subtle and difficult ways, and we therefore believe that `Object` keys will forever be sorted in insertion order in JS V8.

```javascript
const cache = {};
const KEYCACHE_SIZE = 3;

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

setLRU('a', 1); 
setLRU('b', 2); 
setLRU('c', 3);
//cache === {'a': 1, 'b': 2, 'c': 3}
getLRU('a'); 
//cache === {'b': 2, 'c': 3, 'a': 1}
setLRU('d', 4); 
//cache === {'c': 3, 'a': 1, 'd': 4}
```

## encrypt and decrypt



## Full demo

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
function uint8ToHexString(ar){
  return Array.from(ar).map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

function hexStringToUint8(str){
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
async function encryptAESGCM(password, iv, plaintext){
  const key = await makeKeyAESGCM(password, iv);
  const ptUint8 = new TextEncoder().encode(plaintext);                               // encode plaintext as UTF-8
  const ctBuffer = await crypto.subtle.encrypt({name: key.algorithm.name, iv: iv}, key, ptUint8);                   // encrypt plaintext using key
  const ctArray = Array.from(new Uint8Array(ctBuffer));                              // ciphertext as byte array
  return ctArray.map(byte => String.fromCharCode(byte)).join('');             // ciphertext as string
}

async function decryptAESGCM(password, iv, ctStr){
  const key = await makeKeyAESGCM(password, iv);
  const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0))); // ciphertext as Uint8Array
  const plainBuffer = await crypto.subtle.decrypt({name: key.algorithm.name, iv: iv}, key, ctUint8);                 // decrypt ciphertext using key
  return new TextDecoder().decode(plainBuffer);                                       // return the plaintext
}
//ENCRYPT & DECRYPT end

const SECRET = 'klasjdfoqjpwoekfj!askdfj';

function makeEncryptedPage(encryptDecrypt, text){
  return `
<h1>This data is no longer ${encryptDecrypt}:</h1>
<div>${text}</div>
<a href="/${encryptDecrypt}/${text}">${encryptDecrypt} this data</a>`;
}

const header = {status: 201, headers: {"content-type": "text/html"}};

async function handleRequest(req) {
  const url = new URL(req.url);
  const [ignore, action, data] = url.pathname.split('/');
  if(action === 'encrypt'){
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await encryptAESGCM(SECRET, iv, data);
    const encrypted = uint8ToHexString(iv) + '.' + toBase64url(btoa(cipher));
    return new Response(makeEncryptedPage('decrypt', encrypted), header);
  }
  if(action === 'decrypt'){
    let decrypted = getLRU(data);
    if(!decrypted){
      const [ivString, ciphertext] = data.split('.');
      const ciphertextRaw = atob(fromBase64url(ciphertext));
      const iv = hexStringToUint8(ivString);                                            
      decrypted = await decryptAESGCM(SECRET, iv, ciphertextRaw);
      setLRU(data, decrypted);
    }
    return new Response(makeEncryptedPage('encrypt', decrypted), header);
  }
  return new Response(makeEncryptedPage('encrypt', 'hello sunshine115'), header);
}

addEventListener('fetch', async e => e.respondWith(handleRequest(e.request)));
```