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
var missionImpossible = new MouseEvent("mousedown", {composed: true, bubbles: true, clientX: 12, clientY: 34, button: 0});
missionImpossible.type += "-is-trusted";
window.dispatchEvent(missionImpossible);
```

This event will now be converted to a message passed to the ClickIsTrusted extension which will enact the event in true `isTrusted` form on you webpage.
