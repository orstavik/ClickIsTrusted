function makeTable(y, x) {
  const res = Array.from({length: y}, () => Array(x));
  //1. make default rows
  for (let i = 0; i < y; i++) res[i] = [i];
  for (let i = 1; i < x; i++) res[0][i] = i;
  return res;
}

let maxY = 2000;
let maxX = 2000;
let cachedTable = makeTable(maxY, maxX);

function getTable(y, x) {
  if (x <= maxX && y <= maxY)
    return cachedTable;
  return cachedTable = makeTable(Math.max(y, maxY), Math.max(x, maxX));
}

function levTable(a, b) {
  const y = b.length + 1;
  const x = a.length + 1;
  const res = getTable(y, x);

  //2. filling the body.
  for (let i = 1; i < y; i++) {
    for (let j = 1; j < x; j++) {
      //smallest of top,left,topLeft + 1 if different/0 if the same
      res[i][j] = Math.min(res[i - 1][j], res[i][j - 1], res[i - 1][j - 1]) + (a[j - 1] !== b[i - 1] | 0);
    }
  }
  return res;
}

//Delete, Insert, Substitute, Match
//return ['D', index, chars, index2]
function nextLevenshteinOp(res, i, j, strX, strY) {
  if (j === 0)
    return ['D', j, strY[i - 1], i - 1];
  if (i === 0)
    return ['I', j - 1, strX[j - 1], i];
  const now = res[i][j];
  const left = res[i - 1][j];
  const topLeft = res[i - 1][j - 1];
  const top = res[i][j - 1];
  if (topLeft <= top && topLeft <= left)
    return [now === topLeft ? 'M' : 'S', j - 1, strX[j - 1], i - 1];
  if (top <= left)
    return ['I', j - 1, strX[j - 1], i];
  return ['D', j, strY[i - 1], i - 1];
}

function charOps(table, i, j, strX, strY) {
  const res = [];
  for (let op; i || j; j = op[1], i = op[3]) {
    let nextOp = nextLevenshteinOp(table, i, j, strX, strY);
    op = nextOp;
    let prevOp = res[0];
    if (prevOp && prevOp[0] === op[0]) {
      res[0][1] = op[1];
      res[0][2] = op[2] + prevOp[2];
    } else
      res.unshift(op);
  }
  return res;
}
//
// function stringOps(charOps) {
//   const res = [];
//   let prevOp = [];
//   for (let op of charOps)
//     prevOp[0] === op[0] ? prevOp[2] += op[2] : res.push(prevOp = op);
//   return res;
// }

export function levenshtein(a, b) {
  return charOps(levTable(a, b), b.length, a.length, a, b);
}