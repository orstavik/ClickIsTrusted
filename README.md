# ClickIsTrusted

> Chrome extension that lets you dispatch native events during tests.

1. Install ClickIsTrusted as a chrome extension. 
   1. Download/clone the project from github into a local folder.
   2. Open Chrome(ium) browser and the page [chrome://extensions/](chrome://extensions/).
   3. Select `developer mode` top right corner.
   4. `Load unpacked` and select the local folder where you stored this project.
   5. Click on the extension symbol in the top right corner of you browser, and `pin` the ClickIsTrusted extension.
   6. ClickIsTrusted is now installed. Maybe you need to restart Chrome, but don't think so.

2. ClickIsTrusted is always in deactivated mode. To start ClickIsTrusted you must click on its symbol (the small cursor in black outline in the top bar right of the url). When ClickIsTrusted is active for one of your tabs, then you see a red arrow. When it is deactivated for that tab, the arrow is black.
 
**ATT!! You must always start ClickIsTrusted on individual tabs. When you reload or navigate to a new page within the same tab, ClickIsTrusted remains active.**

3. When ClickIsTrusted is running, you can use it from within the web page by dispatching particular native events that you see below. 

**The idea is that ClickIsTrusted adds some extra events in the browser: `mousemove-is-trusted` for example. Your web page can now dispatch these events, and the extension will pick them up and turn them into real, native events.**

This is for testing purposes. Your web page must build their own test framework. The ClickIsTrusted has no opinion about what your test framework should look like, **except one thing!! You must have some ms delay between events, as the browser will only allow 1 or 2 or 3 such native events to exist in the queue at any time**. Or something like that. So have ~16ms between the native events, and you will most likely be fine.

4. To run one of the default tests, just install the ClickIsTrusted extension, activate it in a tab in Chrome(ium), and then open for example [workingTest/testMouse.html](workingTest/testMouse.html).  

## How to use ClickIsTrusted from your web page?

The ClickIsTrusted enables you to run unit tests and other quality control and debug tools. 
To use it, you would set up your own scripts/web pages that run their own logic.
Within your own scripts, whenever you want to call a native event, you would simply enable ClickIsTrusted, and then run:

```javascript
window.dispatchEvent(new MouseEvent("mousedown-is-trusted", {composed: true, bubbles: true, clientX: 12, clientY: 34, button: 0, buttons: 1}));
window.dispatchEvent(new MouseEvent("mousemove-is-trusted", {composed: true, bubbles: true, clientX: 11, clientY: 33, button: 1, buttons: 2}));
window.dispatchEvent(new MouseEvent("mouseup-is-trusted", {composed: true, bubbles: true, clientX: 11, clientY: 33, button: 0, buttons: 3}));
window.dispatchEvent(new WheelEvent("wheel-is-trusted", {composed: true, bubbles: true, deltaX: 3, deltaY: 4, buttons: 0}));
```

This event will now be converted to a message passed to the ClickIsTrusted extension which will enact the event in true `isTrusted` form on you webpage.

To test this from a random webpage, add these listeners in the console in devtools, and then run the missionImpossibles above:

```javascript
window.addEventListener("mousedown", e=>console.log(e.type, e.x, e.y, e));
window.addEventListener("mouseup", e=>console.log(e.type, e.x, e.y, e));
window.addEventListener("mousemove", e=>console.log(e.type, e.x, e.y, e));
window.addEventListener("wheel", e=>console.log(e.type, e.deltaX, e.deltaY, e));
```
## MouseEvents

The `MouseEvents` that can be replicated natively are: `mousedown`, `mouseup`, `mousemove`, `wheel`.

The properties that can be conferred with these events are:
`e.clientX`, 
`e.clientY`, 
`e.button`,
`e.buttons`,  

and for the `WheelEvent`, the extra two: `e.deltaX` and `e.deltaY`.
 
In addition, an `e.modifiers` attribute that register if `alt`, `shift`, `ctrl`, `meta` have been pressed. This is generated automatically for all native events, based on the corresponding normal properties for the modifier keys in js `Event` interface.
  
## KeyboardEvents

The `KeyboardEvents` that can be replicated natively are: `keydown` and `keyup`.

The properties on the `KeyboardEvents` that can be transferred, in addition to `type`, are:

```
modifiers: makeModifiersInteger(e),
key: e.key,
code: e.code,
location: e.location,
autoRepeat: e.repeat,

text,
keyIdentifier,
unmodifiedText,
isKeyPad,
isSystemKey,
nativeVirtualKeyCode,
windowsVirtualKeyCode,
``` 

## `beforeinput`

The `beforeinput` event can be replicated (in Chrome only?).

There is only one property that is transferred: `data`.

```javascript
window.dispatchEvent(new InputEvent("beforeinput-is-trusted", {composed: false, bubbles: true, data: "abc"}));

window.addEventListener("beforeinput", e=>console.log(e.type, e.isTrusted, e.data, e));
```

## TouchEvents

The `TouchEvents` that can be replicated natively are: `touchstart`, `touchend`, `touchmove`, `touchcancel`.

The properties that can be conferred with these events are:
`e.type`, 
`e.modifiers`, 
`e.touchPoints` (which is an array of TouchPoints).

Each `touchPoint` consists of the following values:
```
    x: t.clientX,
    y: t.clientY,
    radiusX: t.radiusX,
    radiusY: t.radiusY,
    rotationAngle: t.rotationAngle,
    force: t.force,
    id: t.identifier
``` 
In addition, an `e.modifiers` attribute that register if `alt`, `shift`, `ctrl`, `meta` have been pressed. This is generated automatically for all native events, based on the corresponding normal properties for the modifier keys in js `Event` interface.

