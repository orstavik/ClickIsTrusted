# HowTo: cache in workers' memory?

Many workers can run in parallel, even on the same server. And Cloudflare will take down existing workers when they want to. And create new ones. This means that two workers with different memory content can run side by side on the same server, or on different server. And that a worker can be killed in one ms and then a new worker created the next ms to handle two different request. Put simply, you cannot rely on data stored in the workers' memory to be around between requests. 

But. Workers are handy beasts. They are very lightweight in both memory and processor power, and therefore Cloudflare let them live for weeks, not seconds between requests. This means that you *can* use the memory of a worker to cache computed results or results retrieved from a database. 

## LRU cache

**Least Recently Used** cache is a simple method of only remembering entities that are currently in use. A cache is useful when we need to avoid doing heaving computation of pure functions again and again, when the function receives the same input data. 

For us, there are two different usecases for an LRU cache in CF workers:

1. Using AES-GCM, if the same message is being decrypted again and again, and the cache is safe in the memory of the running app, then a LRU cache can be an excellent alternative to avoid performing superfluous decryption processes that cost the runtime environment upto 1 ms per execution.

2. Instead of asking for the same resource from the KV store multiple times, both waiting 40ms for the KV store to respond, and paying nano-dollars for the request, we can simply store the requests in an LRU cache, of a limited size, and then use these cached results when possible.

## Implementation: LRU cache
 
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

## References: