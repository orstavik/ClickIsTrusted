console.log("contentscript for ClickIsTrusted, click here to debug.");

//att 1. calling chrome.runtime cannot be done from inside the event listener. (a different 'this' context?? don't know).
//att 2. All the UIEvent that serialize to {isTrusted: true} can be handled the same.
function sendMessage(e) {
  const res = {};
  res.type = e.type;
  for (let prop of Object.keys(e))
    res[prop] = e[prop];
  for (let prop of Object.keys(Object.getPrototypeOf(e)))
    res[prop] = e[prop];    //function, nodes and other complex properties are removed by chrome.runtime.sendMessage
  chrome.runtime.sendMessage(res);
}

function manInTheMiddle(event) {
  console.log("passing request for native event to background.js:", event);
  event.stopImmediatePropagation();
  event.preventDefault();
  sendMessage(event);
}

window.addEventListener("mousedown-is-trusted", manInTheMiddle);