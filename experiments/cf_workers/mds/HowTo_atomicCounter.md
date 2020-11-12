# HowTo: make an atomic counter using `countapi.xyz`?

## Prepare yourself 1: make a 64 char long private key

To create a unique key, for yourself, on your super safe computer, 
   paste the following code into devtools:

```javascript
function make64Key(){
  const x = crypto.getRandomValues(new Uint8Array(48));
  const b64 = btoa(String.fromCharCode.apply(null, x));
  return b64.replace(/\//g, '_').replace(/\+/g, '-');
}
makeKey();
```

You can also access it from this demo using `/makeKey`.
Keep the KEY (and possibly also the DOMAIN) a secret.

## Prepare yourself 2: create a 64 char long private key on countapi.xyz

To make a counter on `countapi.xyz`, replace namespace and key with your own values (demo values are `example.com` and `dvAV77q6uaIOSzE_cgq6Bs_q-vojyIglNLW8lWHtiGUuWM03mLCZnaWIqTtlWYhk`).

`https://api.countapi.xyz/create?namespace=example.com&key=dvAV77q6uaIOSzE_cgq6Bs_q-vojyIglNLW8lWHtiGUuWM03mLCZnaWIqTtlWYhk&update_lowerbound=0&update_upperbound=1&value=64`

Check your counter by looking at its info on countapi.xyz:
`https://api.countapi.xyz/info/example.com/dvAV77q6uaIOSzE_cgq6Bs_q-vojyIglNLW8lWHtiGUuWM03mLCZnaWIqTtlWYhk`

You can use the counter by calling:
`https://api.countapi.xyz/hit/example.com/dvAV77q6uaIOSzE_cgq6Bs_q-vojyIglNLW8lWHtiGUuWM03mLCZnaWIqTtlWYhk`

The countapi.xyz returns json data.

## Demo: atomic counter in a cloudflare worker using `countapi.xyz` 

```javascript
const DOMAIN = 'example.com';
const KEY = 'dvAV77q6uaIOSzE_cgq6Bs_q-vojyIglNLW8lWHtiGUuWM03mLCZnaWIqTtlWYhk';
const hitCounter = `https://api.countapi.xyz/hit/${DOMAIN}/${KEY}`;

async function count(){
  const nextCount = await fetch(hitCounter);
  const data = await nextCount.json();
  return data.value;
}

function make64Key(){
  const x = crypto.getRandomValues(new Uint8Array(48));
  const b64 = btoa(String.fromCharCode.apply(null, x));
  return b64.replace(/\//g, '_').replace(/\+/g, '-');
}

async function handleRequest(req){
  if(req.url.indexOf('/makeKey')>= 0)
    return new Response(`Your new secret key is: ${make64Key()}.`);   
  const andAOne = await count();
  return new Response(`You are number: ${andAOne}, which in base36(UUID) is '${andAOne.toString(36)}'.`); 
}

addEventListener('fetch', e=>e.respondWith(handleRequest(e.request)));
```

## References

* [countapi.xyz](https://countapi.xyz)