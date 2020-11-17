# HowTo: HASH SHA-256? 

HASH SHA-256 is a hashing algorithm that creates a random number/string given different input number/string. The hash algorithm always returns the same output for the same input, but you cannot recreate the input from the output (without serious, time consuming and costly effort). It is a one way function.

```javascript
const buffer256long = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SECRETstring));
```

## Input/output to the hash sha-256 function

```javascript
const output = await crypto.subtle.digest('SHA-256', input);
```

 * `input`: an `ArrayBuffer` with a number. It is common to create such a number using `new TextEncoder().encode(SECRETstring)`.
 * `output`: an `ArrayBuffer` with a number. To convert this `ArrayBuffer` to a more recognizable string, use the following method:
  
```javascript
function bufferToString(hash1) {
  const array1 = new Uint8Array(hash1);
  return Array.from(array1).map(b => ('00' + b.toString(16)).slice(-2)).join(''); 
}
```

The SHA-256 method always return the same output for the same input (pure, stateless function), and the result is always 256digits/64chars long, even when the input is much shorter or much longer than 256digits.

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

## Caching the HASH SHA-256

The HASH SHA-256 takes a little time to run. Therefore, when we need to run the same HASH SHA-256 method for the same input string in a worker, which is very common when we for example hash a secret password, it is very smart to cache the output.

```javascript
let cachedPassHash;

async function passHash(SECRET) {
  return cachedPassHash || (cachedPassHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SECRET)));
}
```

## References:

* 
