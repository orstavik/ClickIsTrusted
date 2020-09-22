function stringOps(charOps) {
  const res = [];
  let prevOp = [];
  for (let op of charOps)
    prevOp[0] === op[0] ? prevOp[2] += op[2] : res.push(prevOp = op);
  return res;
}

function headMatch(a, b) {
  const length = Math.min(a.length, b.length);
  for (let j = 0; j < length; j++) {
    if (a[j] !== b[j])
      return a.substr(0, j);
  }
  return a.substr(0, length - 1);
}


//todo both cleaning operations might create two operations side by side. These operations should be merged.

function cleanLevenshtein(ops) {
  const res = [];
  for (let i = 0; i < ops.length; i++) {
    const [oneOp, oneIndex, oneStr] = ops[i];
    const [twoOp, twoIndex, twoStr] = ops[i + 1] || [];
    const [threeOp, threeIndex, threeStr] = ops[i + 2] || [];
    if (oneOp === 'I' && twoOp === 'M' && threeOp === 'I' && threeStr.endsWith(twoStr)) {
      res.push([oneOp, oneIndex, oneStr + twoStr + threeStr.substr(0, threeStr.length - twoStr.length)]);
      res.push([twoOp, twoIndex + threeStr.length, twoStr]);
      i += 2;
      continue;
    }
    if ((oneOp === 'I' || oneOp === 'D') && twoOp === 'M') {
      //if the head of the insert/delete matches the head of the match, this is called overlap
      const overlapStr = headMatch(oneStr, twoStr);
      if (overlapStr !== "") {
        const firstIndex = oneIndex + overlapStr.length;
        const firstStr = oneStr.substr(overlapStr.length) + overlapStr;
        const secondIndex = twoIndex + overlapStr.length;
        const secondStr = twoStr.substr(overlapStr.length);
        res.push(['M', firstIndex - overlapStr.length, overlapStr]);
        //todo this should most likely be added to the previous match, but it is not critical I think.
        res.push([oneOp, firstIndex, firstStr]);
        res.push([twoOp, secondIndex, secondStr]);
        i++;
        continue;
      }
    }
    if (oneOp === 'D' && twoOp === 'S' && oneIndex === twoIndex) {
      res.push(['R', twoIndex, twoStr, twoStr.length + oneStr.length]);
      i++;
      continue;
    }
    if (oneOp === 'I' && twoOp === 'S' && oneIndex + oneStr.length === twoIndex) {
      res.push(['R', oneIndex, oneStr + twoStr, twoStr.length]);
      i++;
      continue;
    }
    res.push(ops[i]);
  }
  return res;
}

export function unify(levenshteinOps) {
  const strOps = stringOps(levenshteinOps);
  const clean = cleanLevenshtein(strOps);
  return clean.filter(([op, index, str]) => op !== 'M');
}

export function convert(str, levyOps) {
  str = str.split("");
  for (let [op, index, chars, length] of levyOps) {
    chars = chars.split("");
    if (op === 'S')
      str.splice(index, chars.length, ...chars);
    if (op === 'R')
      str.splice(index, length, ...chars);
    else if (op === 'I')
      str.splice(index, 0, ...chars);
    else if (op === 'D')
      str.splice(index, chars.length);
  }
  return str.join("");
}

// export function convert(str, levyOps) {
//   const substitutes = levyOps.map(([op, index, chars]) => {
//     if (op === "substitute")
//       return [index, chars.length, chars];
//     if (op === 'I')
//       return [index, 0, chars];
//     if (op === 'D')
//       return [index, chars.length];
//   });
//   str = str.split("");
//   for (let args of substitutes)
//     str.splice(...args);
//   return str.join("");
// }