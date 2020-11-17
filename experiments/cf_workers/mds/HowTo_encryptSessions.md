# HowTo: use encryption to create server-browser sessions? 

The general concept of a 'session' is a state that is remembered by both the browser and the server over several http messages.

The simplest way to remember such a state, is to use a cookie. The cookie is stored by the browser, and then included in every transaction from the browser to the server. As long as the server stays passive (ie. does not need to push messages and therefore need some kind of web socket), the cookie works well as a session store.

## Why add encryption?

The problem with cookies, is that they are saved by the browser. And the browser is unsafe, someone might read the content of cookies without the browser owner knowing about it. And if someone can read the cookie in the browser memory, they can a) steal it, and b) use the information in that cookie to create their own fake cookies to hack the server system.
  
Thus, two things need to happen:
1. The information inside the cookie must be encrypted so that any attacker that reads a cookie in the browser memory can make new fake cookies with the same format to hack the system.

2. The cookies must have a timestamp so that if someone gets a hold of a cookie, he/she cannot use that cookie for too long.

So. The server can save state between different http messages with the same browser/user by:
   1. Take the state information the server needs to remember until next time.
   2. Add a timestamp to this information.
   3. Encrypt this information.
   4. Put the encrypted information in a cookie or a redirect parameter.
   5. when receving a redirect or another http request, look for the redirect parameter or the cookie.
   6. decrypt this information and check the timestamp.
   7. use the same state information that it had from the previous session.

## Authentication and sessions.

There are two times during authentication that we needto store state:
 * state parameter and
 * sessionID cookie.   

### Benefits/drawbacks with encrypting state in sessions

Encryption is:
1. super fast (<1ms) and takes no memory resources,
2. require no db operations, which usually costs money, and
3. doesn't save user data on the server, thus more readily complies with GPRS.

Drawbacks of encryption are:
1. more data in HTTP packets (big cookie or big redirect parameter),
2. encryption secret can be mined out from several HTTP packets, and is thus open for another type of attack, and
3. more complex code in the encryption layer.

## Demo:

1.  we have a worker that redirects to itself with a state parameter with encrypted data

```
1. browser => GET my.worker.dev/ => worker
2. worker makes a state param, with ttl, iat, passphrase and encrypts it with SECRET
3. browser <= REDIRECT: my.worker.dev/?state=abc123 <= worker
4. browser => GET my.worker.dev/?state=abc123 => worker
5. worker decrypts the state param with the same SECRET, checks the ttl, iat, and passphrase

6. creates a new sessionID object with iat, ttl, userId (which is just a fixed value like 'Max')
7. sets this sessionID as a cookie
8. browser <= 200: my.worker.dev/ with SESSIONID cookie <= worker
9. browser => GET my.worker.dev/showCookie => worker
10. worker decrypts the cookie coming with the http request, using the same SECRET, checks the ttl, iat, and finds the userID.
11. browser <= 200: my.worker.dev/showCookie with the value of the userId <= worker
```

## Demo code:

```javascript
//hello max

```