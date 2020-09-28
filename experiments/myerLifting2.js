export function convert(ref, ops, targetToRef) {
  return ops.filter(op => op[2] !== (targetToRef ? '+' : '-')).map(op => op[3]).join('');
}

export function myersDiff(tar, ref) {
  const endX = ref.length;
  const endY = tar.length; //when we reach these values, we break

  let n = 0;
  while (tar[n] === ref[n])
    n++;

  let res = [{0: 0}, {}];
  for (let d = 1; d < 10000; d++) {
    res[d + 1] = {};
    for (let k = Math.max(-d, -tar.length); k <= Math.min(d, ref.length); k += 2) {
      const previousUpIsBest = k === -d || k !== d && res[d - 1][k + 1] > res[d - 1][k - 1];  //true if we are coming down, false if we are coming up.
      const previousK = previousUpIsBest ? k + 1 : k - 1;
      const previousX = res[d - 1][previousK];
      // const previousY = previousX - previousK;
      const nowX = previousX + (!previousUpIsBest ? 1 : 0);
      const nowY = nowX - k;
      let n = 0;
      while (ref[nowX + n] === tar[nowY + n] && nowY + n < endX && nowY + n < endY)
        n++;
      res[d][k] = nowX + n;
      res[d + 1][k] = nowX + n;
      if (nowX + n === endX && nowY + n === endY)
        return convertDKsToListOfCoordinates(res, d, k, ref, tar);
    }
  }
}

function convertDKsToListOfCoordinates(res, d, k, ref, tar) {
  let coords = [];
  while (d) {
    const x = res[d][k];
    const y = x - k;
    coords.unshift([x, y]);
    d--;
    if (res[d][k - 1] > res[d][k + 1] || res[d][k + 1] === undefined) //what about undefined??
      k--;
    else
      k++;
  }
  return postProcess(coords, ref, tar)
  // return coords;
}

function postProcess(coords, ref, tar) {
  const output = [];
  let oneX = 0;
  let oneY = 0;
  for (let i = 0; i < coords.length; i++) {
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