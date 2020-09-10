console.log("contentscript for ClickIsTrusted, click here to debug.");

function makeModifiersInteger(e) {
  let res = 0;
  if (e.getModifierState("Alt"))
    res += 1;
  if (e.getModifierState("Ctrl"))
    res += 2;
  if (e.getModifierState("Meta"))
    res += 4;
  if (e.getModifierState("Shift"))
    res += 8;
  return res;
}

function convertMouseType(type) {
  if (type.startsWith("mousedown"))
    return "mousePressed";
  if (type.startsWith("mouseup"))
    return "mouseReleased";
  if (type.startsWith("mousemove"))
    return "mouseMoved";
  if (type.startsWith("wheel"))
    return "mouseWheel";
  throw new Error(`The ${type} event cannot be replicated by the ClickIsTrusted extension.`);
}

function convertButton(button) {
  if (button === 0)
    return "left";
  if (button === 1)
    return "middle";
  if (button === 2)
    return "right";
  if (button === 3)
    return "back";
  if (button === 4)
    return "forward";
}

function convertMouseEvent(e) {
  return {
    type: convertMouseType(e.type),
    modifiers: makeModifiersInteger(e),
    buttons: e.buttons,
    button: convertButton(e.button),
    x: e.clientX,
    y: e.clientY,
    deltaX: e.deltaX,
    deltaY: e.deltaY,
    // deltaMode: e.deltaMode, //isn't active in the interface.
    // timestamp: e.timestamp //todo include this one??
    // pointerType: "mouse" || "pen" //todo enable this one??
  };
}

function convertTouchEvent(e) {
  throw new Error("todo")
}

function convertKeyEvent(e) {
  throw new Error("todo")
}

//att 1. calling chrome.runtime cannot be done from inside the event listener. (a different 'this' context?? don't know).
function sendMessage(e) {
  if (e instanceof MouseEvent)
    chrome.runtime.sendMessage(convertMouseEvent(e));
  if (e instanceof TouchEvent)
    chrome.runtime.sendMessage(convertTouchEvent(e));
  if (e instanceof KeyboardEvent)
    chrome.runtime.sendMessage(convertKeyEvent(e));
}

function manInTheMiddle(event) {
  console.log("passing request for native event to background.js:", event);
  event.stopImmediatePropagation();
  event.preventDefault();
  sendMessage(event);
}

window.addEventListener("mousedown-is-trusted", manInTheMiddle);
window.addEventListener("mousemove-is-trusted", manInTheMiddle);
window.addEventListener("mouseup-is-trusted", manInTheMiddle);
window.addEventListener("wheel-is-trusted", manInTheMiddle);