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
function update(cmd, j, strY, i, prevOp) {
  if (prevOp && prevOp[0] === cmd) {
    prevOp[1] = j;
    prevOp[2] = strY + prevOp[2];
    prevOp[3] = i;
    return prevOp;
  }
  return [cmd, j, strY, i];
}

//return 'D' or 'I' or 'S' or 'M'
function nextLevenshteinOp(res, i, j) {
  if (j === 0) return 'D';
  if (i === 0) return 'I';
  const left = res[i - 1][j];
  const topLeft = res[i - 1][j - 1];
  const top = res[i][j - 1];
  if (left < top && left < topLeft)
    return 'D';
  if (top < topLeft)
    return 'I';
  const now = res[i][j];
  if (now === topLeft)
    return 'M';
  return 'S';
}

//returns a list of string edit ops
function editOps(table, i, j, strX, strY) {
  const res = [];
  while (i || j) {
    const cmd = nextLevenshteinOp(table, i, j);
    i = cmd === "I" ? i : i - 1;
    j = cmd === "D" ? j : j - 1;
    const char = cmd === "D" ? strY[i] : strX[j];
    if (res[0] && cmd === res[0][0]) {
      res[0][1] = j;
      res[0][2] = char + res[0][2];
    } else {
      res.unshift([cmd, j, char]);
    }
  }
  return res;
}

export function levenshtein(a, b) {
  return editOps(levTable(a, b), b.length, a.length, a, b);
}