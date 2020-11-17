# main data structure

1. all data is public. But you can only write to your own user identities (which are anonymous).
2. no data in the server db contain information that can link to IRL identity.
3. no data in the server db is deleted nor overwritten.
4. the session is only stored on the user side/browser. The session holds only data that the user passes us himself when he authenticates with an openid provider.

## The `user object`

```javascript
const userObject = { 
  uid: 'D2G', 
  username: 'github.com/john.doe', //or 'john.doe@gmail.com'
  iat: 1605619440958,
  ttl: 60*60*24*10,
  rememberMe: 1
}
```

1. When a user logs in, he is paired with a `uid`. 
   * If the user logs in for the first time, he/she will get a new `uid` using an atomic counter. This `uid` is then stored in the user database on the server as a `_googleOrGithubId_uid`/`uid_googleOrGithubId` pair in the user database. 
   * If the user has logged in before, his google or github id is matched with the `uid` in the db.

2. In addition to the `uid`, the `username` is added to the user object. The username is added so that the user can see which account is logged in using a familiar name. For google, the `username` is a gmail: `john.doe@gmail.com`. For github, the `username` is user homepage: `github.com/john.doe`. 

3. `iat`, `ttl` and `rememberMe` is added so that the validity of a session can be calculated.    

The user object is stored in an aes-gcm-encrypted sessionID cookie in the browser. When the `username` needs to be shown on screen it is either delivered directly from the authentication window or retrieved via a call to `auth.2js.no/username` call that will decrypt the cookie and return the `username` as pure text. `2js.no` doesn't store nor use the `username` serverside, nor use the `username` yet.

Requirement of user consent is considered fulfilled via `'Remember me on this computer'` user prompt. 

## App data

The keys of the data stored on the system follow this format. The value associated with each key is a json object (or `null`).

```
 * uid := /[A-Z0-9_-]{2,}/ 
 * file := /[a-zA-Z0-9_-][.a-zA-Z0-9_-]{3,30}\.(html|js|css|mjs|svg)/
 * time := /[0-9]{13}/
 * cmd := /[a-zA-Z0-9_-]{2,6}/
 *
 * point := userid/file/time
 * entry := point/cmd/point
```

An example entry in the kv store would be:  

```
k2r/myTest.html/1605619440958/op/k2r/myTest.html/1605619440957 =>['i',0,'abc']
```

If we consider `k2r/myTest.html/1605619440958` to be `p1` and `k2r/myTest.html/1605619440957` as `p2`, a small KV database would be:

```
p1/op    : v0
p2/op/p1 : v1
p3/op/p1 : v2
p4/op/p2 : v3
p5/op/p3 : v4
p5/op/p4 : v5
```  

When this data is taken into the memory, then it is converted into this format (Note! The map represents a directional graph. To signify direction, the operator name is placed in reverse: `op`/`po`):

```javascript
const state = {
  p1: {
    op: {'': v0},
    po: {
      p2: v1,
      p3: v2
    }
  },
  p2: {
    op: {p1: v1},
    po: {p4: v3},
  },
  p3: {
    op: {p1: v2},
    po: {p5: v4},
  },
  p4: {
    op: {p2: v3},
    po: {p5: v5},
  }
}
```  

## Query app data

1. user files? `kvStore.list({beginsWith: uid})`, iterate all, and filename in a set. On complete iteration, the set will contain all the filenames for that user.
2. file data? `kvStore.list({beginsWith: uid/filename})`. Convert this list into in memory map.
3. text for data? use the in memory map to build a list of all text operations, then put those text operations in the map.  
4. delete text. mark text as no longer in use.
5. merge texts, mark a new text entry as the descendant of two other texts with two different mutation strands.
6. new text. make a new text with empty content (or filled content).
7. fork text. take a text from another user(or yourself) and then save it under a new name. 

## views:

1. create
   1. create text: {newId, 'CREATE'} => "string".
      filetypes: .html, .js, .css, .json. Essentially, just fill in two points, an input for a filename that must end with a valid filetype, and a textarea with the text, and a button to save the file.
    
2. edit
   1. show text: . Load a text with a version and show it. 
   1. updates text: {newId, '', oldId} => editOps. Load old text file, make changes, convert changes to editOps and save the editOps as newId.

3. demo
   1. list dependencies. Can be detected from the code itself.
   1. show html page: . Either in a different frame or in a new window. Make base64 version of the file and listed dependencies. This enables the view repeatedly based solely on local files and no traffic to the server.

4. branch
   1. show all verisons of a text: . Make a graph of all versions and populate them with links to an editView.
   1. merge: {newId, 'MERGE', oldId} => null. Make a point in the branch that illustrate how a version has superseded another version.  
   1. delete: {newId, 'DELETE', oldId} => null. Mark a point in the branch as no longer of value.
   1. tag: {newId, 'TAG', oldId} => null. Mark a point in the branch as the owner of a label. rules for semantic version labeling can be applied, meaning that no existing tag can break the semantic rules for the added tag. This only applies to semantic version tags. (starting with 'v'?). 
   1. fork/rename: {newId, '', oldId}=>snapshot of oldId. Make a new version of the given file with either a new name and same author or with a new author and new or same fileName.
   1. create test: {newId, 'CREATE'} => "string".
      filetypes: .json.

5. single .tst.json
   .tst.json is a file with five properties: 
   * the html file to be tested
   * the body of a js function 
   * a list of event names
   * a browser id
   
   1. show test results. list of event=> value. Diff between each value entry.
   2. show demo.
   3. show test function code.
   4. show list of events to be recorded.
   5. show the browser id.
   
   * button to start recording new test results.
   * button to save a new version.
   * button to for the test: rename.

4. multiple tests 
   1. list of all tests for a file.
   2. only the last version of the test are marked as active.
   3. button to run all the tests against the file again.

   To edit the json file should be done in a special view. To choose the html file, to create the test results, this is a special task. We can save a test function with an empty test result set. We can also save a test set that is not 