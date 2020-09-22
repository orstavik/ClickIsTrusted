function stringOps(charOps) {
  const res = [];
  let prevOp = [];
  for (let op of charOps)
    prevOp[0] === op[0] ? prevOp[2] += op[2] : res.push(prevOp = op);
  return res;
}

function cleanMatchInTheMiddle3(ops) {
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
    // if (oneOp === 'I' && (twoOp === 'M' || twoOp === 'D')) {
    //   const overlapStr = headMatch(oneStr, twoStr);
    //   if (overlapStr !== "") {
    //     oneIndex += overlapStr.length;
    //     oneStr = oneStr.substr(overlapStr.length) + overlapStr;
    //     twoIndex += overlapStr.length;
    //     twoStr = twoStr.substr(overlapStr.length);
    //     res.push(['M', oneIndex - overlapStr.length, overlapStr]);
    //     res.push([oneOp, oneIndex, oneStr]);
    //     res.push([twoOp, twoIndex, twoStr]);
    //     i++;
    //     continue;
    //   }
    // }
    res.push(ops[i]);
  }
  return res;
}

//
// function cleanMatchInTheMiddle(strOps) {
//   const res = [];
//   for (let i = 0; i < strOps.length; i++) {
//     const [middleOp, middleIndex, middleStr] = strOps[i];
//     if (i > 0 && i < strOps.length - 1 && middleOp === 'M') {
//       const [beforeOp, beforeIndex, beforeStr] = strOps[i - 1];
//       const [afterOp, afterIndex, afterStr] = strOps[i + 1];
//       if (beforeOp === 'I' && afterOp === 'I') {
//         if (afterStr.endsWith(middleStr)) {
//
//           res[res.length - 1][2] += middleStr + afterStr.substr(0, afterStr.length - middleStr.length);
//           res.push([middleOp, middleIndex + afterStr.length, middleStr]);
//           i++;
//           continue;
//         }
//       }
//     }
//     res.push(strOps[i]); //todo, make res and strOps immutable by cloning the array here??
//   }
//   return res;
//   //todo, there might be two match operations here that are not inline..
// }
//
function headMatch(a, b) {
  const length = Math.min(a.length, b.length);
  for (let j = 0; j < length; j++) {
    if (a[j] !== b[j])
      return a.substr(0, j);
  }
  return a.substr(0, length - 1);
}

function cleanMoveOperationsToTheEnd(strOps) {
  const res = [];
  for (let i = 0; i < strOps.length; i++) {
    let [firstOp, oneIndex, oneStr] = strOps[i];
    let [secondOp, twoIndex, twoStr] = strOps[i + 1] || [];
    if ((firstOp === 'I' || firstOp === 'D') && secondOp === 'M') {
      //if the head of the insert matches the head of the match, this is called overlap
      const overlapStr = headMatch(oneStr, twoStr);
      if (overlapStr !== "") {
        const firstIndex = oneIndex + overlapStr.length;
        const firstStr = oneStr.substr(overlapStr.length) + overlapStr;
        const secondIndex = twoIndex + overlapStr.length;
        const secondStr = twoStr.substr(overlapStr.length);
        res.push(['M', firstIndex - overlapStr.length, overlapStr]);
        res.push([firstOp, firstIndex, firstStr]);
        res.push([secondOp, secondIndex, secondStr]);
        i++;
        continue;
      }
    }
    res.push(strOps[i]); //todo, make res and strOps immutable by cloning the array here??
  }
  return res;
}

export function unify(levenshteinOps) {
  const strOps = stringOps(levenshteinOps);
  const clean1 = cleanMatchInTheMiddle3(strOps);
  const clean2 = cleanMoveOperationsToTheEnd(clean1);
  //todo both cleaning operations might create two operations side by side. These operations should be merged.
  return clean2.filter(([op, index, str]) => op !== 'M');
}

export function convert(str, levyOps) {
  str = str.split("");
  for (let [op, index, chars] of levyOps) {
    chars = chars.split("");
    if (op === 'S')
      str.splice(index, chars.length, ...chars);
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