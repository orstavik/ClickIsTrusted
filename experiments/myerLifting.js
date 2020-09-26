export function convert(ref, ops, targetToRef) {
  return ops.filter(op => op[2] !== (targetToRef ? '+' : '-')).map(op => op[3]).join('');
}

let pointsVisited = [];

function makeBranch(x, y, ref, tar) {
  let n = 0;
  while (ref[x + n] === tar[y + n] && x + n < ref.length && y + n < tar.length)
    n++;
  const end = (x + n) + ',' + (y + n);
  if (pointsVisited.indexOf(end) !== -1) //set up a single 2d array to keep both the points and the points visited as one.
    return null;
  pointsVisited.push(end);
  return [[x + n, y + n]];
}

export function myersDiff(tar, ref) {

  if (ref === tar)
    return [];
  let n = 0;
  while (ref[n] === tar[n])
    n++;

  let branches = [[[n, n]]];
  while (true) {
    let nextBranches = [];
    for (let i = 0; i < branches.length; i++) {
      let branch = branches[i];
      let [x, y] = branch[0];
      //go right/delete from a
      if (x < ref.length) {
        let res = makeBranch(x + 1, y, ref, tar);
        if (res) {
          if (res[0][0] === ref.length && res[0][1] === tar.length)
            return postProcess(res.concat(branch), ref, tar);
          nextBranches.push(res.concat(branch));
        }
      }
      //go down/insert from b
      if (y < tar.length) {
        let res = makeBranch(x, y + 1, ref, tar);
        if (res) {
          if (res[0][0] === ref.length && res[0][1] === tar.length)
            return postProcess(res.concat(branch), ref, tar);
          nextBranches.push(res.concat(branch));
        }
      }
    }
    branches = nextBranches;
  }
}

function postProcess(res, ref, tar) {
  const output = [];
  let oneX = 0;
  let oneY = 0;
  for (let i = res.length - 2; i >= 0; i--) {
    let two = res[i];
    const nextX = two[0];
    const nextY = two[1];
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