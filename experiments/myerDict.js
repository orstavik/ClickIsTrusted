export function makeDictDiff(rawOps, tar, ref, minPartialLength) {
  const dict = {};
  const ops = [];
  for (let [x, y, op, length, str] of rawOps) {
    //adding string to dict
    if (!dict[str])
      dict[str] = [x, y, length];
    else if (dict[str][0] === -1)
      dict[str][0] = x;
    else if (dict[str][1] === -1)
      dict[str][1] = y;

    ops.push([op, str]);
  }
  let diff = {ref, tar, dict, ops};
  diff = enhanceDiff(diff);
  // diff = enhanceDiff(diff, minPartialLength);
  //todo here we need to enhance further, ie. search for partial copies of at both the head and tail of words not yet matched on both sides.
  return diff;
}

//update the -1 values only, otherwise keep the first appearance of the substring
export function enhanceDiff(diff) {
  for (let key of Object.keys(diff.dict)) {
    if (diff.dict[key][0] === -1)
      diff.dict[key][0] = diff.ref.indexOf(key);
    else if (diff.dict[key][1] === -1)
      diff.dict[key][1] = diff.tar.indexOf(key);
  }
  return diff;
}

export function inverseDiff(diffDict) {
  return {
    tar: diffDict.ref,
    ref: diffDict.tar,
    dict: diffDict.dict,
    ops: diffDict.ops.map(([op, index]) => op === '-' ? ['+', index] : op === '+' ? ['-', index] : [op, index])
  };
}

export function convert(diffDict) {
  return diffDict.ops.filter(([op, str]) => op !== '-').map(([op, str]) => str).join('');
}

//Should we remove the delete operations?
// + removing delete ops will enable us to remove all the dict entries that is only used by delete ops.
// + we can remove the delete ops from the list of ops.
// - All the dict entries are coordinates, as the x (and length) is known for all delete ops.
// - an op list entry is very small, just two small numbers.
// - if we remove the delete ops and the y coordinate from the operations, then the op list can no longer be resurrected.
//   We can regenerate the tar from the ref, yes,
//   but no, in order to get all the other metadata, we need to recalculate the myers snake complete.
export function compress({dict, ops}) {

  //1. convert the dictionary into an array when the inserted/deleted/matching string is found in the ref string.
  //2. update the pointers in the op list to reference the key in the array
  return {
    d: Object.keys(dict).map(w => {
      const w2 = dict[w].slice();
      if (w2[0] === -1)
        w2[0] = w;
      return w2;
    }),
    o: ops.map(([op, w]) => [op, Object.keys(dict).indexOf(w)])
  };
}

// conclusion: the compress keeps the data about the deletes and y position in the target reference.
//             thus the corresponding extract method can recreate the original dictionary fully, based only on the ref.

export function extract({d, o}, ref) {
  //1. convert the dictionary to a full string object
  const dict = {};
  const keys = Array(d.length);
  for (let i = 0; i < d.length; i++) {
    let [x, y, l] = d[i];
    const str = typeof (x) === 'string' ? x : ref.substr(x, l);
    typeof (x) === 'string' && (x = -1);
    dict[str] = [x, y, l];
    keys[i] = str;
  }
  //1. add the keyStrings to the operator list
  const ops = o.map(([op, index]) => [op, keys[index]]);
  return {dict, ops, ref};
}