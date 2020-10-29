# HowTo: decode JWT objects?

## step 1: jwt = `header.payload.signature`

```javascript
const jwt = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQwNWVmMjBjNDUxOTFlZmY2NGIyNWQzODBkNDZmZGU1NWFjMjI5ZDEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1OTU1NjQwNzIwNTAtNXQ0aTE0Z2UzZzBiN2tucmhuOGFuOXB1amhhNTNtNnEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1OTU1NjQwNzIwNTAtNXQ0aTE0Z2UzZzBiN2tucmhuOGFuOXB1amhhNTNtNnEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTc4MjQyNzg2NjQwNTE3NzczMTEiLCJlbWFpbCI6Im9yc3RhdmlrNzdAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJjVm15UkVsVk0yLS02eXFlLWU1eXpBIiwibm9uY2UiOiIxY2M1YThlODlkOTNiYWRmZWQ1M2NhNjQiLCJpYXQiOjE2MDM5Nzc0OTQsImV4cCI6MTYwMzk4MTA5NH0.FyqWQUdfXQDCaLYKkxl_EqkhipxRCL54ezr8VpFmlzV1etw3-Rc7Sf-e-EOoEIdrSJj79gla_GwOTJkC8t2BqiiL5U8V1M9Ih_ovsh4Ha8QhQn78_zKx07JBIP0G6XYnvWiRBLQJFW_BXmhH9YMXF8uJPsFOfniQB-MMUg4FAAeTnpvScR4aJAq49CiPy67xZrFyDrnyKgWzt8SDdPz1jtEeQM8XwmJHDZqfnex3zM2jxb5xt7xxZREL_OHJlCioSLXWL-1qsQSelg9Tp9xBHrjyZnYdsy6drTMAeaAswHPlMG6z48UYBwxfkf4PabZ29EcuTw-3nS3UzGJEby1E7w';

const [header, payload, signature] = jwt.split('.');
```

## step 2: `header` and `payload` are converted to base64url

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

const header = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImQwNWVmMjBjNDUxOTFlZmY2NGIyNWQzODBkNDZmZGU1NWFjMjI5ZDEiLCJ0eXAiOiJKV1QifQ";
const payload = "eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1OTU1NjQwNzIwNTAtNXQ0aTE0Z2UzZzBiN2tucmhuOGFuOXB1amhhNTNtNnEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1OTU1NjQwNzIwNTAtNXQ0aTE0Z2UzZzBiN2tucmhuOGFuOXB1amhhNTNtNnEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTc4MjQyNzg2NjQwNTE3NzczMTEiLCJlbWFpbCI6Im9yc3RhdmlrNzdAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJjVm15UkVsVk0yLS02eXFlLWU1eXpBIiwibm9uY2UiOiIxY2M1YThlODlkOTNiYWRmZWQ1M2NhNjQiLCJpYXQiOjE2MDM5Nzc0OTQsImV4cCI6MTYwMzk4MTA5NH0";

const headerText = atob(fromBase64url(header));
const payloadText = atob(fromBase64url(payload));
```

## step 3: the header and payload are json objects 
 
```javascript
const headerText = `{"alg":"RS256","kid":"d05ef20c45191eff64b25d380d46fde55ac229d1","typ":"JWT"}`;
const payloadText = `{"iss":"https://accounts.google.com","azp":"595564072050-5t4i14ge3g0b7knrhn8an9pujha53m6q.apps.googleusercontent.com","aud":"595564072050-5t4i14ge3g0b7knrhn8an9pujha53m6q.apps.googleusercontent.com","sub":"117824278664051777311","email":"orstavik77@gmail.com","email_verified":true,"at_hash":"cVmyRElVM2--6yqe-e5yzA","nonce":"1cc5a8e89d93badfed53ca64","iat":1603977494,"exp":1603981094}`;

const payloadObj = JSON.parse(payloadText);
const headerObj = JSON.parse(headerText);
```

## step 4: verify the explicit content of the data

Checklist:
1. payloadObj.iss should be your expected issuer uri.
2. payloadObj.aud should be your clientID.
3. payloadObj.exp should be less than what you expect
4. payloadObj.iat should be not before you expect, nor after
 
## ref