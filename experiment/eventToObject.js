function nodeToText(n) {
  if (!n)
    return null;
  return n.tagName ? n.tagName + (n.id ? "#" + n.id : "") :
    n === window ? "window" :
      n === document ? "document" :
        n.parentNode.tagName + "#root";
}

function targetProps(e) {
  return {
    composedPath: e.composedPath().map(nodeToText),
    target: nodeToText(e.target),
    relevantTarget: nodeToText(e.relevantTarget)
  };
}

const eventProps = ["type", "composed", "bubbles", "timeStamp"];
const mouseProps = ["clientX", "clientY", "button", "buttons", "deltaX", "deltaY"];
const keyboardProps = ["key", "code", "location", "autoRepeat"];

function cloneTouch({identifier, pageX, pageY, radiusX, radiusY, rotationAngle, force}) {
  return {identifier, pageX, pageY, radiusX, radiusY, rotationAngle, force};
}

export function eventToObject(e) {
  const obj = targetProps(e);
  for (let prop of eventProps)
    obj[prop] = e[prop];
  if (e instanceof MouseEvent) {
    for (let prop of mouseProps)
      obj[prop] = e[prop];
  }
  if (e instanceof KeyboardEvent) {
    for (let prop of keyboardProps)
      obj[prop] = e[prop];
  }
  if (e instanceof InputEvent)
    obj.data = e.data;
  if (e instanceof TouchEvent)
    obj.touches = e.touches.map(cloneTouch);
  return obj;
}