# HowTo: self-closing cookie maker

## Why?

the self-closing cookie maker is very handy to make a self closing login window that is safe and unobtrusive to UX.

## How?

1. a link opens a new window with a link to the cookie maker, the link includes a state.
2. the cookie maker sends a response with:
   1. a cookie,
   2. a system.postMessage.
   3. a js call to close the window.   

## Issues

1. ForgetMe cookies will be forgotten by the window. For ForgetMe cookies, we therefore need to set a cookie with a short max-age, and then update that from the main window. This means that we need to set the cookie with a max-age in the popup, and then as a response to the system.postMessage callback, get a new cookie without max-age from the worker.

2. but, looking into the forgetMe cookies, it seems like it might still remain if the window is not removed and the other window tries to load something from the server in the mean time. Then, the cookie is somehow made safe. This is a problem. It also seems from my tests in firefox, that it is difficult to get the popupwindow to overwrite the main window.

3. there are many problems here.. The situation means that we would like to have some kind of means to transport the cookie safely from the selfclosing cookie maker and into the main page.  

## Main page.

The main page will just open the popup in a new window, and addEventListener('message') from the popup.

```html
<h1>hello sunshine: ${cookie}</h1>
RememberMe: <input type='checkbox' /><br>
<a href="one" title="this is 1">open 'one'</a><br>
<a href="two" title="this is 2">open 'two'</a>

<script>
  window.addEventListener('message', e => console.log(e)); //printing the message
  for (let link of document.querySelectorAll("a"))
    link.addEventListener('click', openRequestedSinglePopup);

  function popupParameters() {
    const width = Math.min(600, window.screen.width);
    const height = Math.min(600, window.screen.height);
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    return "resizable,scrollbars,status,opener," +
      Object.entries({width, height, left, top}).map(kv => kv.join('=')).join(',');
  }

  let loginWindow;
  let loginWindowUrl;

  function openRequestedSinglePopup(event) {
    event.preventDefault();
    let url = event.currentTarget.href;
    if(document.querySelector('input').checked) 
      url+='/rememberMe';
    if (!loginWindow || loginWindow.closed)
      loginWindow = window.open(url, "_blank", popupParameters());
    else if (loginWindowUrl !== url)
      loginWindow.location = url;
    loginWindowUrl = url;
    loginWindow.focus();
  }
</script>
```

## Popup

The popup itself will only contain some data (in a secure session cookie), and then `system.postMessage()` the opener window, and then close itself. Here, we just add the value in plaintext, but it should be protected by the secure cookie restrictions.

```html
<h1>hello sunshine ${value}</h1>
<script>
  setTimeout(function () {
    window.opener.postMessage('popup was successful', '${myDomain}');
    window.close();
  }, 2000);
</script>
```

## The worker

The worker will present the two files, depending on the path. The worker is also responsible for setting any cookies on the response.

```javascript
function getCookieValue(cookie, key) {
  return cookie?.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`)?.pop();
}

function mainpage(cookie, popupOrigin){ 
  return `<h1>hello sunshine 21: ${cookie}</h1>
RememberMe: <input type='checkbox' /><br>
<a href="one" title="this is 1">open 'one'</a><br>
<a href="two" title="this is 2">open 'two'</a>

<script>

  function receiveLoginData(e){
    if (e.origin !== "${popupOrigin}" || e.source !== loginWindow)
      return;
    const div = document.createElement('div');
    div.innerText = e.data;
    document.body.appendChild(div);
  }

  window.addEventListener('message', receiveLoginData);
  
  for (let link of document.querySelectorAll("a"))
    link.addEventListener('click', openRequestedSinglePopup);

  function popupParameters() {
    const width = Math.min(600, window.screen.width);
    const height = Math.min(600, window.screen.height);
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    return "resizable,scrollbars,status,opener," +
      Object.entries({width, height, left, top}).map(kv => kv.join('=')).join(',');
  }

  let loginWindow;
  let loginWindowUrl;

  function openRequestedSinglePopup(event) {
    event.preventDefault();
    let url = event.currentTarget.href;
    if(document.querySelector('input').checked) 
      url+='/rememberMe';
    if (!loginWindow || loginWindow.closed)
      loginWindow = window.open(url, "_blank", popupParameters());
    else if (loginWindowUrl !== url)
      loginWindow.location = url;
    loginWindowUrl = url;
    loginWindow.focus();
  }
</script>`;
}

function popup(cookieData, myDomain){ 
  return `
<h1>success, will self destruct</h1>
<script>
  //setTimeout(function () {
    window.opener.postMessage('${cookieData}', '${myDomain}');
    //window.close();
  //}, 2000);
</script>`;
}

const myDomain = 'its-a-popup.2js-no.workers.dev';

function handleRequest(req){

  const url = new URL(req.url);
  const [ignore, action, data] = url.pathname.split('/');
  if(action === 'one' || action === 'two')
    return new Response(popup(action + '+' + data, 'https://' + myDomain), {status: 201, headers: {
      'content-type': 'text/html',
      'set-cookie': `popupCookie=${action + '+' + data}; Secure; HttpOnly; SameSite=Strict; Path=/; Domain=${myDomain};`
    }});
  if(action === 'logout')
    return new Response('logout', {status: 201, headers: {
      'content-type': 'text/html',
      'set-cookie': `popupCookie=undefined; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=-1; Domain=${myDomain}; `
    }});
  const cookie = getCookieValue(req.headers.get('cookie'), 'popupCookie');
  return new Response(mainpage(cookie, 'https://' + myDomain), {status: 201, headers: {'content-type': 'text/html'}});
}

addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));
```

