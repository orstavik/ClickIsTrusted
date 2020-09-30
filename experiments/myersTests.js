export const testsMyers = [
  ["zc", "cd", [[0, 0, "+", 1, "z"], [0, 1, " ", 1, "c"], [1, 2, "-", 1, "d"]]],
  ["cde", "zce", [[0, 0, "-", 1, "z"], [1, 0, " ", 1, "c"], [2, 1, "+", 1, "d"], [2, 2, " ", 1, "e"]]],
  ["zce", "cde", [[0, 0, "+", 1, "z"], [0, 1, " ", 1, "c"], [1, 2, "-", 1, "d"], [2, 2, " ", 1, "e"]]],
  ["CBABAC", "ABCABBA", [[0, 0, "-", 2, "AB"], [2, 0, " ", 1, "C"], [3, 1, "+", 1, "B"], [3, 2, " ", 2, "AB"], [5, 4, "-", 1, "B"], [6, 4, " ", 1, "A"], [7, 5, "+", 1, "C"]]],
  ["aa", "aaB", [[0, 0, " ", 2, "aa"], [2, 2, "-", 1, "B"]]],
  ["A", "B", [[0, 0, "-", 1, "B"], [1, 0, "+", 1, "A"]]],
  ["AB", "CD", [[0, 0, "-", 2, "CD"], [2, 0, "+", 2, "AB"]]],
  ["ABCDEF", "MNOPQRS", [[0, 0, "-", 7, "MNOPQRS"], [7, 0, "+", 6, "ABCDEF"]]],
  ["asab", "saab", [[0, 0, "+", 1, "a"], [0, 1, " ", 2, "sa"], [2, 3, "-", 1, "a"], [3, 3, " ", 1, "b"]]],
  ["ab", "abab", [[0, 0, " ", 2, "ab"], [2, 2, "-", 2, "ab"]]],
  ["bc", "c", [[0, 0, "+", 1, "b"], [0, 1, " ", 1, "c"]]],
  ["c", "bc", [[0, 0, "-", 1, "b"], [1, 0, " ", 1, "c"]]],
  ["abc", "ac", [[0, 0, " ", 1, "a"], [1, 1, "+", 1, "b"], [1, 2, " ", 1, "c"]]],
  ["ac", "abc", [[0, 0, " ", 1, "a"], [1, 1, "-", 1, "b"], [2, 1, " ", 1, "c"]]],
  ["favorite", "fervourite", [[0, 0, " ", 1, "f"], [1, 1, "-", 2, "er"], [3, 1, "+", 1, "a"], [3, 2, " ", 2, "vo"], [5, 4, "-", 1, "u"], [6, 4, " ", 4, "rite"]]],
  ["fervourite", "favorite", [[0, 0, " ", 1, "f"], [1, 1, "-", 1, "a"], [2, 1, "+", 2, "er"], [2, 3, " ", 2, "vo"], [4, 5, "+", 1, "u"], [4, 6, " ", 4, "rite"]]],
  ["3a3a", "a", [[0, 0, "+", 3, "3a3"], [2, 3, " ", 1, "a"]]],
  ["aaazced", "abcdef", [[0, 0, " ", 1, "a"], [1, 1, "-", 1, "b"], [2, 1, "+", 3, "aaz"], [2, 4, " ", 1, "c"], [3, 5, "-", 1, "d"], [4, 5, " ", 1, "e"], [5, 6, "-", 1, "f"], [6, 6, "+", 1, "d"]]],
  ["abcdef", "aaazced", [[0, 0, " ", 1, "a"], [1, 1, "-", 3, "aaz"], [4, 1, "+", 1, "b"], [4, 2, " ", 1, "c"], [5, 3, "-", 1, "e"], [6, 3, " ", 1, "d"], [7, 4, "+", 2, "ef"]]],
  ["abcabcdef", "abcdef", [[0, 0, " ", 3, "abc"], [3, 3, "+", 3, "abc"], [3, 6, " ", 3, "def"]]],
  ["abcdef", "abcabcdef", [[0, 0, " ", 3, "abc"], [3, 3, "-", 3, "abc"], [6, 3, " ", 3, "def"]]],
  ["abc_abc_ef", "abc_def", [[0, 0, " ", 4, "abc_"], [4, 4, "-", 1, "d"], [5, 4, "+", 4, "abc_"], [5, 8, " ", 2, "ef"]]],
  ["1abcde2", "abcde", [[0, 0, "+", 1, "1"], [0, 1, " ", 5, "abcde"], [5, 6, "+", 1, "2"]]],
  ["123abcde456", "abcde", [[0, 0, "+", 3, "123"], [0, 3, " ", 5, "abcde"], [5, 8, "+", 3, "456"]]],
  ["English is my favorite subject at school.", "Inglesh iz my fervourite sabject at skool.", [[0, 0, "-", 1, "I"], [1, 0, "+", 1, "E"], [1, 1, " ", 3, "ngl"], [4, 4, "-", 1, "e"], [5, 4, "+", 1, "i"], [5, 5, " ", 4, "sh i"], [9, 9, "-", 1, "z"], [10, 9, "+", 1, "s"], [10, 10, " ", 5, " my f"], [15, 15, "-", 2, "er"], [17, 15, "+", 1, "a"], [17, 16, " ", 2, "vo"], [19, 18, "-", 1, "u"], [20, 18, " ", 6, "rite s"], [26, 24, "-", 1, "a"], [27, 24, "+", 1, "u"], [27, 25, " ", 10, "bject at s"], [37, 35, "-", 1, "k"], [38, 35, "+", 2, "ch"], [38, 37, " ", 4, "ool."]]],
  ["ivar--0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz--max", "0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz", [[0, 0, "+", 6, "ivar--"], [0, 6, " ", 279, "0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz"], [279, 285, "+", 5, "--max"]]]
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
  ["ivir-" + makeStr(100) + "-max", makeStr(100), [["I", 0, "ivir-"], ["I", 2605, "-max"]]],
  ["ivir-" + makeStr(500) + "-max", makeStr(500), [["I", 0, "ivir-"], ["I", 2605, "-max"]]],
];
