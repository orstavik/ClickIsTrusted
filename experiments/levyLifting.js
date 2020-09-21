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
function lowestTopLeftAction(res, i, j) {
  if (j === 0)
    return ['D', i - 1, j];
  if (i === 0)
    return ['I', i, j - 1];
  const now = res[i][j];
  const left = res[i - 1][j];
  const topLeft = res[i - 1][j - 1];
  const top = res[i][j - 1];
  if (topLeft <= top && topLeft <= left)
    return [now === topLeft ? 'M' : 'S', i - 1, j - 1];
  if (top <= left)
    return ['I', i, j - 1];
  return ['D', i - 1, j];
}

//todo make charOps iterate, not recursive
function charOps(table, i, j, strX, strY) {
  if (i === 0 && j === 0)
    return [];
  const [op, nextI, nextJ] = lowestTopLeftAction(table, i, j);
  const res = charOps(table, nextI, nextJ, strX, strY);
  res.push([op, nextJ, op === 'D' ? strY[nextI] : strX[nextJ]]);
  return res;
}

export function levenshtein(a, b) {
  return charOps(levTable(a, b), b.length, a.length, a, b);
}