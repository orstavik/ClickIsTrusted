# HowTo: base64url

base64 is a handy format for taking binary text strings and encoding them into a smaller text format safe to be transported and positioned elsewhere. But. It turns out that base64 is not 100% safe either. It turns out that base64 is using `+` and `/` and `=` which are not safe to be used in urls. Therefore, we would like to convert base64 into an even safer text format: base64url.

## `toBase64url(base64str)` and `fromBase64url(base64urlStr)` 

base64url is the same as base64, except that +=>-, /=>_, and the padding (ie. the trailing `=` and `==`) are removed. Yes. It is that simple.

```javascript
function toBase64url(base64str) {
  return base64str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64url(base64urlStr) {
  base64urlStr = base64urlStr.replace(/-/g, '+').replace(/_/g, '/');
  if (base64urlStr.length % 4 === 2)
    return base64urlStr + '==';
  if (base64urlStr.length % 4 === 3)
    return base64urlStr + '=';
  return base64urlStr;
}
```

There are two things to make note of:
1. there is not really a need to include the padding `=` at the end of base64 strings. The need to have padding can be calculated based on the length of the base64 string. Therefore, base64url simply removes the `=` at the end of the base64 strings, and then reapply them based on the length of the base64url string.
2.  when converting a 'normal' string into base64url (via base64), the base64 function is applied *BEFORE* the base64url when the string is encoded, and *AFTER* the base64url function when the string is decoded.

## Demo
 
```javascript
function toBase64url(base64str) {
  return base64str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64url(base64urlStr) {
  base64urlStr = base64urlStr.replace(/-/g, '+').replace(/_/g, '/');
  if (base64urlStr.length % 4 === 2)
    base64urlStr += '==';
  else if (base64urlStr.length % 4 === 3)
    base64urlStr += '=';
  return base64urlStr;
}

const str = 'hello sunshine!?#~<>*!';
console.log(str);                       
const b64 = btoa(str);
console.log(b64);
const b64url = toBase64url(b64); 
console.log(b64url);
const b642 = fromBase64url(b64url)      
console.log(b642);
const str2 = atob(fromBase64url(b642)); 
console.log(str2);
// hello sunshine!?#~<>*!
// aGVsbG8gc3Vuc2hpbmUhPyN+PD4qIQ==
// aGVsbG8gc3Vuc2hpbmUhPyN-PD4qIQ
// aGVsbG8gc3Vuc2hpbmUhPyN+PD4qIQ==
// hello sunshine!?#~<>*! 
```

## References:

 * 