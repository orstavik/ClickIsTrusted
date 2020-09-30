function myers(ref, tar) {
  const endX = ref.length;
  const endY = tar.length;

  let n = 0;
  while (tar[n] === ref[n])
    n++;

  const res = [{0: n}];
  for (let d = 1; d < 10000; d++) {
    res[d] = {};
    for (let k = -d; k <= d; k += 2) {
      const higherValue = res[d - 1][k + 1];
      const lowerValue = res[d - 1][k - 1];
      const comingDown = lowerValue === undefined || lowerValue < higherValue;
      const previousK = comingDown ? k + 1 : k - 1;
      const previousX = res[d - 1][previousK];
      const nowX = comingDown ? previousX : previousX + 1;
      const nowY = nowX - k;
      let n = 0;
      while (ref[nowX + n] === tar[nowY + n] && nowX + n < endX && nowY + n < endY)
        n++;
      res[d][k] = nowX + n;
      if (nowX + n === endX && nowY + n === endY)
        return [res, d, k];
    }
  }
}

//converts d,k to x,y
function makeInsertDeleteSnake(res, d, k) {
  const coords = Array(d + 1);
  const first = res[0][0];
  coords[0] = [first, first];
  for (; d > 0; d--) {
    const x = res[d][k];
    coords[d] = [x, x - k];
    res[d - 1][k - 1] >= res[d - 1][k + 1] || res[d - 1][k + 1] === undefined ? k-- : k++;
  }
  return coords;
}

//splits the matching sequences away from the insert/delete steps, and then merges sequences of inserts and deletes
function splitMatchInSnake(coords) {
  const output = [[0, 0, ' ', coords[0][0]]];
  for (let i = 1; i < coords.length; i++) {
    const [oneX, oneY] = coords[i-1];
    const [twoX, twoY] = coords[i];
    const distX = twoX - oneX;
    const distY = twoY - oneY;
    const min = Math.min(distX, distY);
    const editType = distX > distY ? '-' : '+';
    if (output[output.length - 1][2] === editType)
      output[output.length - 1][3] += 1;
    else
      output.push([oneX, oneY, editType, 1]);
    if (min)
      output.push([twoX - min, twoY - min, ' ', min]);
  }
  if (output[0][3] === 0) //removes the first match if it is empty
    output.shift();
  return output;
}

//adds strings to the list of operations
function addStrings(output, tar, ref) {
  output.forEach(op => op[2] === '+' ? op[3] = tar.substr(op[1], op[3]) : op[3] = ref.substr(op[0], op[3]));
}

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

export function myersDiff(tar, ref) {
  const [map, d, k] = myers(ref, tar);
  const coords = makeInsertDeleteSnake(map, d, k);
  const ops = splitMatchInSnake(coords);
  addStrings(ops, tar, ref);
  return manInTheMiddleShouldBeLast(ops);
}

export function inverseOps(ops) {
  return ops.map(([x, y, op, str]) => [y, x, op === '-' ? '+' : op === '+' ? '-' : op, str]);
}

export function convert(ref, ops) {
  return ops.filter(op => op[2] !== '-').map(op => op[3]).join('');
}