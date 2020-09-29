function manInTheMiddleShouldBeLast(ops) {
  const res = [];
  for (let i = 0; i < ops.length; i++) {
    const [oneIndex, oneIndex2, oneOp, oneStr] = ops[i];
    const [twoIndex, twoIndex2, twoOp, twoStr] = ops[i + 1] || [];
    const [threeIndex, threeIndex2, threeOp, threeStr] = ops[i + 2] || [];
    if (oneOp === '+' && twoOp === ' ' && threeOp === '+' && threeStr.endsWith(twoStr)) {
      res.push([oneIndex, oneIndex2, oneOp, oneStr + twoStr + threeStr.substr(0, threeStr.length - twoStr.length)]);
      res.push([twoIndex + threeStr.length, twoIndex2 + threeStr.length, twoOp, twoStr]);
      i += 2;
    } else {
      res.push(ops[i]);
    }
  }
  return res;
}

function fullMoveOperations(ops) {
  const res = [];
  const seen = [];
  for (let i = 0; i < ops.length; i++) {
    if (seen.indexOf(ops[i] !== -1))
      continue;
    const [oneIndex, oneIndex2, oneOp, oneStr] = ops[i];
    if (oneOp === '+') {
      for (let j = i + 1; j < ops.length; j++) {
        const [twoIndex, twoIndex2, twoOp, twoStr] = ops[j];
        if (twoOp === '-' && oneStr === twoStr) {
          res.push([oneIndex, oneIndex2, twoIndex, twoIndex2, '>', oneStr.length]);
          seen.push(ops[j]);
        }
      }
    }

    if (oneOp === '-') {
      for (let j = i + 1; j < ops.length; j++) {
        const [twoIndex, twoIndex2, twoOp, twoStr] = ops[j];
        if (twoOp === '+' && oneStr === twoStr) {
          res.push([oneIndex, oneIndex2, twoIndex, twoIndex2, '<', oneStr.length]);
          seen.push(ops[j]);
        }
      }
    }
  }
  return res;
}

export function unify(insertDeleteMatchOps) {
  let clean = manInTheMiddleShouldBeLast(insertDeleteMatchOps);
  // clean = fullMoveOperations(clean);
  return clean.filter(([op]) => op !== 'M');
}

export function convert(str, levyOps) {
  str = str.split("");
  for (let [op, index, chars, length] of levyOps) {
    chars = chars.split("");
    if (op === 'S')
      str.splice(index, chars.length, ...chars);
    else if (op === 'R')
      str.splice(index, length, ...chars);
    else if (op === 'I')
      str.splice(index, 0, ...chars);
    else if (op === 'D')
      str.splice(index, chars.length);
  }
  return str.join("");
}