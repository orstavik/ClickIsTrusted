export const tests2 = [
  ["aaazced", "abcdef", [["R", 1, "aaz", 1], ['D', 5, "d"], ['S', 6, "d"]]],
  ["abcdef", "aaazced", [["R", 1, "b", 3], ['I', 3, "d"], ['S', 5, "f"]]],
  ["asab", "saab", [['I', 0, "a"], ['D', 3, "a"]]],
  ["saab", "asab", [['D', 0, "a"], ['I', 2, "a"]]],
  ["abcabcdef", "abcdef", [['I', 3, "abc"]]],
  ["abcdef", "abcabcdef", [['D', 3, "abc"]]],
  ["ab", "abab", [["D", 2, "ab"]]],
  ["3a3a", "a", [['I', 0, "3a3"]]],
  ["favorite", "fervourite", [["R", 1, "a", 2], ["D", 4, "u"]]],
  ["fervourite", "favorite", [["R", 1, "er", 1], ["I", 5, "u"]]],
  ["English is my favorite subject at school.", "Inglesh iz my fervourite sabject at skool.",
    [["S", 0, "E"], ["S", 4, "i"], ["S", 9, "s"], ["R", 15, "a", 2], ["D", 18, "u"], ["S", 24, "u"], ["R", 35, "ch", 1]]],
  ["abc_abc_ef", "abc_def", [["R", 4, "abc_", 1]]],
  ["1abcde2", "abcde", [["I", 0, "1"], ["I", 6, "2"]]],
  ["123abcde456", "abcde", [["I", 0, "123"], ["I", 8, "456"]]],
  ["ivar--0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz--max", "0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz"
    , [["I", 0, "ivar--"], ["I", 285, "--max"]]],
  // abcd---efghijk---opq---rstuv---wxyz
  // bcd---eefh1j---ooq---rrsu2---wxy

  // abcd---efghijk---opq---rstuv---wxyz
  // aabcd---eefh1j---ooq---rrsu2---wxyzz

  // abcd---efghijk---opq---rstuv---wxyz
  // 3a3abcd---eefh1j---ooq---rrsu2---wxy4z4z
];

function makeStr(num ) {
  let str = '';
  for (let i = 0; i < num; i++)
    str += "abcdefghijklmnopqrstuvwxyz";
  return str;
}

export const bigTest = [
  ["ivar-" + makeStr(100) + "-max", makeStr(100), [["I",0,"ivar-"],["I",2605,"-max"]]],
  ["ivar-" + makeStr(500) + "-max", makeStr(500), [["I",0,"ivar-"],["I",2605,"-max"]]],
];
