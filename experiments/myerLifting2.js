export function convert(ref, ops, targetToRef) {
  return ops.filter(op => op[2] !== (targetToRef ? '+' : '-')).map(op => op[3]).join('');
}

export function myersDiff(tar, ref) {
  const endX = ref.length;
  const endY = tar.length; //when we reach these values, we break

  let n = 0;
  while (tar[n] === ref[n])
    n++;

  let res = [{0: n}, {0: n}];
  for (let d = 1; d < 10000; d++) {
    res[d + 1] = {};
    for (let k = -d; k <= d; k += 2) {
      //todo not sure about this capping..Not sure it is ever useful, and not sure that it is safe. If one of the texts is a lot shorter than the other, it might make sense though..
      //bug, doesn't work
      // if (k < -tar.length || k > ref.length)
      //   continue;
      const previousUpIsBest = k === -d || k !== d && res[d - 1][k + 1] > res[d - 1][k - 1];  //true if we are coming down, false if we are coming up.
      const previousK = previousUpIsBest ? k + 1 : k - 1;
      const previousX = res[d - 1][previousK];
      const nowX = previousX + (previousUpIsBest ? 0 : 1);
      const nowY = nowX - k;
      let n = 0;
      while (ref[nowX + n] === tar[nowY + n] && nowY + n < endX && nowY + n < endY)
        n++;
      res[d][k] = res[d + 1][k] = nowX + n;
      // if(isNaN(res[d][k]))
      //   debugger
      if (nowX + n === endX && nowY + n === endY) {
        // res[0][0] = 0;
        // res[1][0] = 0;
        return postProcess(mapToXY(res, d, k), ref, tar);
      }
    }
  }
}

function mapToXY(res, d, k) {
  const coords = Array(d + 1);
  coords[0] = [res[0][0], res[0][0]];
  for (let i = d; i > 0; i--) {
    const x = res[i][k];
    coords[i] = [x, x - k];
    res[i][k - 1] > res[i][k + 1] || res[i][k + 1] === undefined ? k-- : k++;
  }
  return coords;
}

function postProcess(coords, ref, tar) {
  let [oneX, oneY] = coords[0];
  const output = oneX ? [[oneX, oneY, ' ', ref.substr(0, oneX)]] : [];
  for (let i = 1; i < coords.length; i++) {
    const [nextX, nextY] = coords[i];
    const distX = nextX - oneX;
    const distY = nextY - oneY;
    const min = Math.min(distX, distY);
    const editX = nextX - min;
    const editY = nextY - min;
    output.push([editX, editY, distX > distY ? '-' : '+', distX > distY ? ref[oneX] : tar[oneY]]);
    if (min)
      output.push([nextX, nextY, ' ', ref.substr(editX, min)]);
    oneX = nextX;
    oneY = nextY;
  }
  return output;
}