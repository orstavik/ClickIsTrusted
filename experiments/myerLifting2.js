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

function mapToXY(res, d, k) {
  const coords = Array(d + 1);
  const first = res[0][0];
  coords[0] = [first, first];
  for (let i = d; i > 0; i--) {
    const x = res[i][k];
    coords[i] = [x, x - k];
    res[i - 1][k - 1] >= res[i - 1][k + 1] || res[i - 1][k + 1] === undefined ? k-- : k++;
  }
  return coords;
}

function postProcess(coords, ref, tar) {
  let [oneX, oneY] = coords[0];
  const output = oneX ? [[0, 0, ' ', ref.substr(0, oneX)]] : [];
  for (let i = 1; i < coords.length; i++) {
    const [nextX, nextY] = coords[i];
    const distX = nextX - oneX;
    const distY = nextY - oneY;
    const min = Math.min(distX, distY);
    const editX = nextX - min;
    const editY = nextY - min;
    const editType = distX > distY ? '-' : '+';
    const editValue = distX > distY ? ref[oneX] : tar[oneY];
    if (i > 1 && output[output.length - 1][2] === editType)
      output[output.length - 1][3] += editValue;
    else
      output.push([oneX, oneY, editType, editValue]);
    if (min)
      output.push([editX, editY, ' ', ref.substr(editX, min)]);
    oneX = nextX;
    oneY = nextY;
  }
  return output;
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
  const coords = mapToXY(map, d, k);
  const ops = postProcess(coords, ref, tar);
  return manInTheMiddleShouldBeLast(ops);
}

export function inverseOps(ops) {
  return ops.map(([x, y, op, str]) => [y, x, op === '-' ? '+' : op === '+' ? '-' : op, str]);
}

export function convert(ref, ops) {
  return ops.filter(op => op[2] !== '-').map(op => op[3]).join('');
}