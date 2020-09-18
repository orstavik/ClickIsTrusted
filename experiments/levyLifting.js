function levTable(a, b) {
  const res = new Array(b.length + 1);
  //1. make default rows
  for (let i = 0; i < b.length + 1; i++) res[i] = [i];
  for (let i = 1; i < a.length + 1; i++) res[0][i] = i;

  //2. filling the body.
  for (let i = 1; i < b.length + 1; i++) {
    for (let j = 1; j < a.length + 1; j++) {
      //smallest of top,left,topLeft + 1 if different/0 if the same
      res[i][j] = Math.min(res[i - 1][j], res[i][j - 1], res[i - 1][j - 1]) + (a[j - 1] !== b[i - 1] | 0);
    }
  }
  return res;
}

function lowestTopLeftAction(res, i, j) {
  if (j === 0)
    return ["delete", i - 1, j];
  if (i === 0)
    return ["insert", i, j - 1];
  const now = res[i][j];
  const left = res[i - 1][j];
  const topLeft = res[i - 1][j - 1];
  const top = res[i][j - 1];
  if (topLeft <= top && topLeft <= left)
    return [now === topLeft ? "match" : "substitute", i - 1, j - 1];
  if (top <= left)
    return ["insert", i, j - 1];
  return ["delete", i - 1, j];
}

function charOps(table, i, j, strX) {
  if (i === 0 && j === 0)
    return [];
  const [op, nextI, nextJ] = lowestTopLeftAction(table, i, j);
  const res = charOps(table, nextI, nextJ, strX); //todo pass in the op here, so it can be used by the next lowestTopLeftAction??
  if (op !== "match")                             //todo we could merge the charOps into string ops here??
    res.push([op, nextJ, strX[nextJ]]);
  return res;
}

function stringOps(charOps) {
  const res = [];
  let prevOp = [];
  for (let op of charOps)
    prevOp[0] === op[0] ? prevOp[2] += op[2] : res.push(prevOp = op);
  return res;
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

export function diff(a, b) {
  const table = levTable(a, b);
  return stringOps(charOps(table, b.length, a.length, a));
}