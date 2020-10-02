## main data structure

user-file-id. 

is a file with lots of entries. This can be an html file, a js file, a css file, a json file, a test json file, a test group json file, etc.

Each file contains a list of lots of entries. such entries can also be added around each file, and these changes will be cleaned up with maybe 5 minutes intervals.
 
Each entry is a cmd. and they reference a relationship between two files. Not file content in a sense, although that may be the data of such a relationship. We can think of the modules that enable us to make such entries as views.

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