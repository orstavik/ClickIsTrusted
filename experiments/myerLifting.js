export function convert(ref, ops, targetToRef) {
  return ops.filter(op => op[2] !== (targetToRef ? '+' : '-')).map(op => op[3]).join('');
}

let pointsVisited = [];

function makeBranch(x, y, ref, tar, xSkew) {
  let n = 0;
  while (ref[x + n] === tar[y + n] && x + n < ref.length && y + n < tar.length)
    n++;
  const end = toCoordinate(x + n, y + n, xSkew);
  if (pointsVisited.indexOf(end) !== -1) //set up a single 2d array to keep both the points and the points visited as one.
    return null;
  pointsVisited.push(end);
  return [end];
}

function toCoordinate(x, y, xSkew) {
  return (x << xSkew) + y;
}

function fromCoordinate(p, xSkew) {
  const x = p >> xSkew;
  const y = p - (x << xSkew);
  return [x, y];
}

export function myersDiff(tar, ref) {

  if (ref === tar)
    return [];
  let n = 0;
  while (ref[n] === tar[n])
    n++;

  const xSkew = tar.length.toString(2).length;
  const theVeryEnd = toCoordinate(ref.length, tar.length, xSkew);

  let branches = [[toCoordinate(n, n, xSkew)]];
  while (true) {
    let nextBranches = [];
    for (let i = 0; i < branches.length; i++) {
      let branch = branches[i];
      let [x, y] = fromCoordinate(branch[0], xSkew);
      //go right/delete from a
      if (x < ref.length) {
        let res = makeBranch(x + 1, y, ref, tar, xSkew);
        if (res) {
          if (res[0] === theVeryEnd)
            return postProcess(res.concat(branch), ref, tar, xSkew);
          nextBranches.push(res.concat(branch));
        }
      }
      //go down/insert from b
      if (y < tar.length) {
        let res = makeBranch(x, y + 1, ref, tar, xSkew);
        if (res) {
          if (res[0] === theVeryEnd)
            return postProcess(res.concat(branch), ref, tar, xSkew);
          nextBranches.push(res.concat(branch));
        }
      }
    }
    branches = nextBranches;
  }
}

function postProcess(coords, ref, tar, xSkew) {
  coords = coords.map(coord => fromCoordinate(coord, xSkew));
  console.log(coords);
  debugger

  const output = [];
  let oneX = 0;
  let oneY = 0;
  for (let i = coords.length - 2; i >= 0; i--) {
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