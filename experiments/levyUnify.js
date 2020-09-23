function headMatch(a, b) {
  if(a === b)
    return a;
  let j = 0;
  while (a[j] === b[j])
    j++;
  return a.substr(0, j);
}

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
  const clean = cleanLevenshtein(levenshteinOps);
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