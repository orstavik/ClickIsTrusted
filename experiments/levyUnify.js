function stringOps(charOps) {
  const res = [];
  let prevOp = [];
  for (let op of charOps)
    prevOp[0] === op[0] ? prevOp[2] += op[2] : res.push(prevOp = op);
  return res;
}

function cleanMatchInTheMiddle(strOps) {
  const res = [];
  for (let i = 0; i < strOps.length; i++) {
    const [middleOp, middleIndex, middleStr] = strOps[i];
    if (i > 0 && i < strOps.length - 1 && middleOp === "match") {
      const [beforeOp, beforeIndex, beforeStr] = strOps[i - 1];
      const [afterOp, afterIndex, afterStr] = strOps[i + 1];
      if (beforeOp === "insert" && afterOp === "insert") {
        if (afterStr.endsWith(middleStr)) {

          res[res.length - 1][2] += middleStr + afterStr.substr(0, afterStr.length - middleStr.length);
          res.push([middleOp, middleIndex + afterStr.length, middleStr]);
          i++;
          continue;
        }
      }
    }
    res.push(strOps[i]); //todo, make res and strOps immutable by cloning the array here??
  }
  return res;
  //todo, there might be two match operations here that are not inline..
}

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
    let [firstOp, firstIndex, firstStr] = strOps[i];
    if ((firstOp === "insert" || firstOp === "delete") && i < strOps.length - 1) {
      let [secondOp, secondIndex, secondStr] = strOps[i + 1];
      if (secondOp === "match") {
        //if the head of the insert matches the head of the match, this is called overlap
        const overlapStr = headMatch(firstStr, secondStr);
        if (overlapStr !== "") {
          firstIndex += overlapStr.length;
          firstStr = firstStr.substr(overlapStr.length) + overlapStr;
          secondIndex += overlapStr.length;
          secondStr = secondStr.substr(overlapStr.length);
          res.push(["match", firstIndex-overlapStr.length, overlapStr]);
          res.push([firstOp, firstIndex, firstStr]);
          res.push([secondOp, secondIndex, secondStr]);
          i++;
          continue;
        }
      }
    }
    res.push(strOps[i]); //todo, make res and strOps immutable by cloning the array here??
  }
  return res;
}

export function unify(levenshteinOps) {
  const strOps = stringOps(levenshteinOps);
  const clean1 = cleanMatchInTheMiddle(strOps);
  //todo both cleaning operations might leave two insert, two matches, two delete, two substitute operations side by side. These operations should be merged.
  const clean2 = cleanMoveOperationsToTheEnd(clean1);
  //todo both cleaning operations might create two operations side by side. These operations should be merged.
  return clean2.filter(([op, index, str]) => op !== "match");
}

export function convert(str, levyOps) {
  str = str.split("");
  for (let [op, index, chars] of levyOps) {
    chars = chars.split("");
    if (op === "substitute")
      str.splice(index, chars.length, ...chars);
    else if (op === "insert")
      str.splice(index, 0, ...chars);
    else if (op === "delete")
      str.splice(index, chars.length);
  }
  return str.join("");
}

// export function convert(str, levyOps) {
//   const substitutes = levyOps.map(([op, index, chars]) => {
//     if (op === "substitute")
//       return [index, chars.length, chars];
//     if (op === "insert")
//       return [index, 0, chars];
//     if (op === "delete")
//       return [index, chars.length];
//   });
//   str = str.split("");
//   for (let args of substitutes)
//     str.splice(...args);
//   return str.join("");
// }