# HowTo: Encrypt and decrypt a message using AES-GCM?

## Why: AES-GCM?

1. We want a native, web crypto solution. Having an algorithm that can be triggered using a native library will be a) much more efficient, b) much faster, and c) much less complex.

2. Of the native algorithms supported in V8, there are only four that supports encryption: RSA-OAEP, AES-CTR, AES-CBC, and AES-GCM. We need a synchronic algorithm, and then there are only three alternatives: AES-CTR, AES-CBC, and AES-GCM.

3. The AES-GCM is the only one of these three algorithms that support checking both authenticity and integrity. Put simply, the GCM mode of AES include a checksum check within the algorithm itself that not only ensures that the encrypted message is a) made using the secret key (authenticity) and not just a random set of numbers, and b) not slightly altered afterwards (integrity). With AES-GCM, such a two purpose checksum check is included.

This means that AES-GCM is 1) the only native web crypto API algorithm for 2) synchronic encryption/decryption that 3) bake in checksum checking.   

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


## encrypt and decrypt



## Demo

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

const plaintext = 'hello sunshine';

console.log(plaintext);

const iv = crypto.getRandomValues(new Uint8Array(12));
const cipher = await encryptAESGCM(SECRET, iv, plaintext);
const encrypted = uint8ToHexString(iv) + '.' + toBase64url(btoa(cipher));
console.log(encrypted);

const [ivString, ciphertext] = encrypted.split('.');
const ciphertextRaw = atob(fromBase64url(ciphertext));
const iv = hexStringToUint8(ivString);
const decrypted = await decryptAESGCM(SECRET, iv, ciphertextRaw);
console.log(decrypted);
```