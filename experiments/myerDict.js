export function makeDictDiff(rawOps, tar, ref, minimumWordLength) {
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
  diff = enhanceDiff(diff, minimumWordLength);
  //todo enhance further, ie. search for partial copies of at both the head and tail of words not yet matched on both sides.
  return diff;
}

//mutates the diff
export function enhanceDiff(diff, minimumWordLength) {
  for (let key of Object.keys(diff.dict)) {
    if(key.length < minimumWordLength)
      continue;
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

export function minimize(diffDict, minimumWordLength) {
  const keys = Object.keys(diffDict.dict);
  //1. convert the dictionary into an array when the inserted/deleted/matching string is found in the ref string.
  const dict = keys.map(key => diffDict[key][0] === -1 ? key : diffDict[key]);
  //2. update the pointers in the op list to reference the key in the array
  const ops = diffDict.ops.map(([op, dictKey]) => [op, keys.indexOf(dictKey)]);
  return {dict, ops};
}