export const testsMyers = [
  ['zc', 'cd', [[-1, 0, "+", "z"], [0, 1, " ", "c"], [1, 1, "-", "d"]]],
  ["cde", "zce", [[0, -1, "-", "z"], [1, 0, " ", "c"], [1, 1, "+", "d"], [2, 2, " ", "e"]]],
  ["zce", "cde", [[-1, 0, "+", "z"], [0, 1, " ", "c"], [1, 1, "-", "d"], [2, 2, " ", "e"]]],
  ["CBABAC", "ABCABBA", [[0, -1, "-", "AB"], [2, 0, " ", "C"], [2, 1, "+", "B"], [3, 2, " ", "AB"], [5, 3, "-", "B"], [6, 4, " ", "A"], [6, 5, "+", "C"]]],
  ["aa", "aaB", [[0, 0, " ", "aa"], [2, 1, "-", "B"]]],
  ["A", "B", [[0, -1, "-", "B"], [0, 0, "+", "A"]]],
  ["AB", "CD", [[0, -1, "-", "CD"], [1, 0, "+", "AB"]]],
  ["ABCDEF", "MNOPQRS", [[0, -1, "-", "MNOPQRS"], [6, 0, "+", "ABCDEF"]]],
  ["asab", "saab", [[-1, 0, "+", "a"], [0, 1, " ", "sa"], [2, 2, "-", "a"], [3, 3, " ", "b"]]],
  ["ab", "abab", [[0, 0, " ", "ab"], [2, 1, "-", "ab"]]],
  ['bc', 'c', [[-1, 0, "+", "b"], [0, 1, " ", "c"]]],
  ['c', 'bc', [[0, -1, "-", "b"], [1, 0, " ", "c"]]],
  ['abc', 'ac', [[0, 0, " ", "a"], [0, 1, "+", "b"], [1, 2, " ", "c"]]],
  ['ac', 'abc', [[0, 0, " ", "a"], [1, 0, "-", "b"], [2, 1, " ", "c"]]],
  ["favorite", "fervourite", [[0, 0, " ", "f"], [1, 0, "-", "er"], [2, 1, "+", "a"], [3, 2, " ", "vo"], [5, 3, "-", "u"], [6, 4, " ", "rite"]]],
  ["fervourite", "favorite", [[0, 0, " ", "f"], [1, 0, "-", "a"], [1, 1, "+", "er"], [2, 3, " ", "vo"], [3, 5, "+", "u"], [4, 6, " ", "rite"]]],
  ["3a3a", "a", [[-1, 0, "+", "3"], [0, 1, " ", "a"], [0, 2, "+", "3a"]]],
  ["aaazced", "abcdef", [[0, 0, " ", "a"], [1, 0, "-", "b"], [1, 1, "+", "aaz"], [2, 4, " ", "c"], [3, 4, "-", "d"], [4, 5, " ", "e"], [5, 5, "-", "f"], [5, 6, "+", "d"]]],
  ["abcdef", "aaazced", [[0, 0, " ", "a"], [1, 0, "-", "aaz"], [3, 1, "+", "b"], [4, 2, " ", "c"], [5, 2, "-", "e"], [6, 3, " ", "d"], [6, 4, "+", "ef"]]],
  ["abcabcdef", "abcdef", [[0, 0, " ", "abc"], [2, 3, "+", "abc"], [3, 6, " ", "def"]]],
  ["abcdef", "abcabcdef", [[0, 0, " ", "abc"], [3, 2, "-", "abc"], [6, 3, " ", "def"]]],
  ["abc_abc_ef", "abc_def", [[0, 0, " ", "abc_"], [4, 3, "-", "d"], [4, 4, "+", "abc_"], [5, 8, " ", "ef"]]],
  ["1abcde2", "abcde", [[-1, 0, "+", "1"], [0, 1, " ", "abcde"], [4, 6, "+", "2"]]],
  ["123abcde456", "abcde", [[-1, 0, "+", "123"], [0, 3, " ", "abcde"], [4, 8, "+", "456"]]],


  ["English is my favorite subject at school.", "Inglesh iz my fervourite sabject at skool.", [[0, -1, "-", "I"], [0, 0, "+", "E"], [1, 1, " ", "ngl"], [4, 3, "-", "e"], [4, 4, "+", "i"], [5, 5, " ", "sh i"], [9, 8, "-", "z"], [9, 9, "+", "s"], [10, 10, " ", " my f"], [15, 14, "-", "er"], [16, 15, "+", "a"], [17, 16, " ", "vo"], [19, 17, "-", "u"], [20, 18, " ", "rite s"], [26, 23, "-", "a"], [26, 24, "+", "u"], [27, 25, " ", "bject at s"], [37, 34, "-", "k"], [37, 35, "+", "ch"], [38, 37, " ", "ool."]]],
  ["ivar--0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz--max", "0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz", [[-1, 0, "+", "ivar--"], [0, 6, " ", "0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz"], [278, 285, "+", "--max"]]],


];

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

function makeStr(num) {
  let str = '';
  for (let i = 0; i < num; i++)
    str += "abcdefghijklmnopqrstuvwxyz";
  return str;
}

export const bigTest = [
  ["ivar-" + makeStr(100) + "-max", makeStr(100), [["I", 0, "ivar-"], ["I", 2605, "-max"]]],
  ["ivar-" + makeStr(500) + "-max", makeStr(500), [["I", 0, "ivar-"], ["I", 2605, "-max"]]],
];
