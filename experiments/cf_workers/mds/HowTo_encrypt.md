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

