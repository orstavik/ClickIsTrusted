#  HowTo: searchParams to JSON

```javascript
/**
 * Convert url searchParams into a JSON result.
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const data = Object.fromEntries(url.searchParams.entries());
  return new Response(JSON.stringify(data, null, 2), {status: 201, headers: {"content-type": "application/json"}});
}

addEventListener('fetch', e =>  e.respondWith(handleRequest(e.request)));
```
