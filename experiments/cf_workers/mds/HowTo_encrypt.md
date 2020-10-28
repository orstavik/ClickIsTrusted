#  HowTo: make a sessionID cookie using Cloudflare workers

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

