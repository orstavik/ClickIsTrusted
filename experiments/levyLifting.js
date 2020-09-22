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
  for (let op; i || j; j = op[1], i = op[3])
    res.unshift(op = nextLevenshteinOp(table, i, j, strX, strY));
  return res;
}

export function levenshtein(a, b) {
  return charOps(levTable(a, b), b.length, a.length, a, b);
}