'use strict';

//part 1. activating/deactivating the debugger via the browserAction button.
const activeTabs = {};

function updateIcon(tabId) {
  const color = activeTabs[tabId] ? 'red' : 'black';
  chrome.browserAction.setIcon({path: `images/${color}_16.png`});
}

function detachTab(tabId) {
  chrome.debugger.detach({tabId: tabId}, function () {
    console.log("detached debugger to tab: " + tabId);
    delete activeTabs[tabId];
    updateIcon(tabId);
  });
}

function attachTab(tabId) {
  chrome.debugger.attach({tabId: tabId}, "1.3", function () {
    console.log("attached debugger to tab: " + tabId);
    activeTabs[tabId] = true;
    updateIcon(tabId);
  });
}

chrome.browserAction.onClicked.addListener(function callback(data) {
  console.log("BrowserAction icon clicked. Attaching/detaching the tab.");
  const tabId = data.id;
  activeTabs[tabId] ? detachTab(tabId) : attachTab(tabId);
});

chrome.tabs.onActivated.addListener(function callback(data) {
  // console.log("A tab activated. Updating icon.");
  updateIcon(data.tabId);
})

//part 2. turning messages into native events for active tabs.
function dispatchMouseEvent(event, tabId) {
  let type = event.type;
  if (type.startsWith("mousedown"))
    type = "mousePressed";
  else if (type.startsWith("mouseup"))
    type = "mouseReleased";
  else if (type.startsWith("mousemove"))
    type = "mouseMoved";
  let button = event.button;
  if (button === 0)
    button = "left";
  else if (button === 1)
    button = "middle";
  else if (button === 2)
    button = "right";
  const x = event.clientX, y = event.clientY;
  chrome.debugger.sendCommand({tabId: tabId}, "Input.dispatchMouseEvent", {type, button, x, y},
    function () {
      console.log("sendCommand: Input.dispatchMouseEvent", {type, button, x, y});
    });
}

function dispatchNativeEvent(event, tabId) {
  //convert the command into an approved native event here.
  if (event.type.startsWith("mouse"))
    return dispatchMouseEvent(event, tabId);
  if (event.type.startsWith("touch"))
    return dispatchTouchEvent(event, tabId);
  if (event.type.startsWith("key"))
    return dispatchKeyEvent(event, tabId);
}

chrome.runtime.onMessage.addListener(function handleMessage(request, sender, sendResponse) {
  //filtering out inactive tabs
  var tabId = sender.tab.id;
  if (!activeTabs[tabId])
    return;
  console.log("received request from clientScript on active tab", request);
  dispatchNativeEvent(request, tabId);
});
// console.log("background.js is up and running.");