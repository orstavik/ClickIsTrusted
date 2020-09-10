# ClickIsTrusted

> Chrome extension that lets you dispatch native events during tests.

1. Install ClickIsTrusted as a chrome extension. So far, you have to download the project and do it in developer mode from a directory on disc.

2. ClickIsTrusted will add itself as a button on the top-right corner of your browser.

3. This button works on a per tab basis. Whenever you click on the button once, it turns red and enables dispatches of native events to your tab.

4. If you click on it again, it turns the dispatch of nativeEvents off for that tab.

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