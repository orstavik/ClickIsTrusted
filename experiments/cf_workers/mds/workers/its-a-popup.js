function getCookieValue(cookie, key) {
  return cookie?.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`)?.pop();
}

function mainpage(cookie, popupOrigin){
  return `<h1>hello sunshine 23: ${cookie}</h1>
RememberMe: <input type='checkbox' /><br>
<a href="one" title="this is 1">open 'one'</a><br>
<a href="two" title="this is 2">open 'two'</a>

<script>

  let loginWindow;
  let loginWindowUrl;

  //function childUnloadsOnMe(){
  //  loginWindow.closed && console.log('the popup window closed');
  //}

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

  function openRequestedSinglePopup(event) {
    event.preventDefault();
    let url = event.currentTarget.href;
    if(document.querySelector('input').checked) 
      url+='/rememberMe';
    if (!loginWindow || loginWindow.closed){
      loginWindow = window.open(url, "_blank", popupParameters());
//      loginWindow.onunload = unloadOnMe;//alternative approach to using postMessage. This will require an extra roundtrip to the server
    }
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
  setTimeout(function () {
    window.opener.postMessage('${cookieData}', '${myDomain}');
    window.close();
  }, 2000);
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