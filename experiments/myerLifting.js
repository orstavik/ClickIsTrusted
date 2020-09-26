export function convert(ref, ops, targetToRef) {
  const filtered = ops.filter(op => op[2] !== (targetToRef ? '+' : '-'));
  console.log(filtered.length)
  for (let op of filtered) {
    console.log("...")
    console.log(op[2])
    console.log(op[3]);
    console.log("x", op[2] === " " ? ref[op[0]-1] : '-'); //the match is the tar[y] and ref[x] value, so we don't need to save that in the line
    console.log("y", op[2] === " " ? ref[op[1]-1] : '-');
  }
  console.log("----")
  return filtered.map(op => op[3]).join('');
}

function isDone(x, y, X, Y) {
  return x === X.length && y === Y.length;
}

let pointsVisited = [];

function makeBranch(x, y, ref, tar, op) {
  let n = 0;
  while (ref[x + n] === tar[y + n] && x + n < ref.length && y + n < tar.length)
    n++;
  const end = (x + n) + ',' + (y + n);
  if (pointsVisited.indexOf(end) !== -1)
    return null;
  pointsVisited.push(end);
  const res = [[x, y, op, op === '-' ? ref[x - 1] : tar[y - 1]]];
  // if ( n>0)
  //   res.unshift([x + n + 1, y + n + 1, ' ', ref.substr(x, n)]);
  // if(n === 2)
  //   debugger
  for (let i = 0; i < n; i++)
    res.unshift([x + i + 1, y + i + 1, ' ', ref[x + i]]);
  return res;
}

export function myersDiff(tar, ref) {
  if (ref === tar)
    return [];

  let n = 0;
  while (ref[n] === tar[n])
    n++;
  let branches = [[[n, n, ' ', ref.substr(0, n)]]];

  let done = false;
  while (true) {

    let nextBranches = [];
    for (let i = 0; i < branches.length; i++) {
      let branch = branches[i];
      let [x, y] = branch[0];
      //go right/delete from a
      if (x < ref.length) {
        let res = makeBranch(x + 1, y, ref, tar, '-');
        if (res) {
          nextBranches.push(res.concat(branch));
          done = done || isDone(res[0][0], res[0][1], ref, tar);
        }
      }
      //go down/insert from b
      if (y < tar.length) {
        let res = makeBranch(x, y + 1, ref, tar, '+');
        if (res) {
          nextBranches.push(res.concat(branch));
          done = done || isDone(res[0][0], res[0][1], ref, tar);
        }
      }
    }
    if (done) {
      let res = nextBranches.filter(branch => branch[0][0] === ref.length && branch[0][1] === tar.length);
      res = res[0];
      res.pop();
      res.reverse();
      //todo mergeDeleteAndInsert(res); //todo cleanup, merge delete and insert into substitute
      return res;
    }
    branches = nextBranches;
  }
}