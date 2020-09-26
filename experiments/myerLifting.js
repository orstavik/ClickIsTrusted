export function convert(ref, ops, targetToRef) {
  const filtered = ops.filter(op => op[2] !== (targetToRef ? '+' : '-'));
  // console.log(filtered.length)
  // for (let op of filtered) {
  //   console.log("...")
  //   console.log(op[2])
  //   console.log(op[3]);
  //   console.log("x", op[2] === " " ? ref[op[0] - 1] : '-'); //the match is the tar[y] and ref[x] value, so we don't need to save that in the line
  //   console.log("y", op[2] === " " ? ref[op[1] - 1] : '-');
  // }
  // console.log("----")
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
  if (pointsVisited.indexOf(end) !== -1) //set up a single 2d array to keep both the points and the points visited as one.
    return null;
  pointsVisited.push(end);
  const res = [[x, y, op, op === '-' ? ref[x - 1] : tar[y - 1]]];
  if (n > 0)
    res.unshift([x + n, y + n, ' ', ref.substr(x, n)]);
  //todo, add the match operation with the insert delete, and instead game out the diagonal match in post production.
  return res;
}

export function myersDiff(tar, ref) {
  if (ref === tar)
    return [];

  let n = 0;
  while (ref[n] === tar[n])
    n++;
  let branches = [[[n, n, ' ', ref.substr(0, n), ' ']]];

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
      res.reverse();
      addingOperatorStringsPostProduction(res, ref, tar);
      return res;
    }
    branches = nextBranches;
  }
}

function addingOperatorStringsPostProduction(res, ref, tar) {
  for (let i = 1; i < res.length; i++) {
    let one = res[i - 1];
    let two = res[i];
    if ((one[0] - two[0]) === (one[1] - two[1])) {
      two.push(" ");
      two.push(ref.substr(one[0], two[0] - one[0]));
      // two.push(tar.substr(one[1], two[0] - one[0])); //you can find this from both the tar and the ref, using either the y or the x value.
    } else if (one[0] + 1 === two[0]) {
      two.push("-");
      two.push(ref[one[0]]);
    } else if (one[1] + 1 === two[1]) {
      two.push("+");
      two.push(tar[one[1]]);
    }
  }
  debugger
}