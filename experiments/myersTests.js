export const testDictionary = [
  ["hello", "world", {
    "dict": {"world": [0, -1, 5], "hello": [-1, 0, 5]},
    "ops": [["-", "world"], ["+", "hello"]]
  }],
  ["abcdefghijklmnopqrstuvwxyz_abcdefghijklmnopqrstXXXuvw", "abcdefghijklmnopqrstuvwxyz_", {
    "dict": {"abcdefghijklmnopqrstuvwxyz_": [0, 0, 27], "abcdefghijklmnopqrst": [0, 27, 20], "XXXuvw": [-1, 47, 6]},
    "ops": [[" ", "abcdefghijklmnopqrstuvwxyz_"], ["+", "abcdefghijklmnopqrst"], ["+", "XXXuvw"]]
  }], ["zc", "cd", {
    "dict": {"z": [-1, 0, 1], "c": [0, 1, 1], "d": [1, -1, 1]},
    "ops": [["+", "z"], [" ", "c"], ["-", "d"]]
  }], ["cde", "zce", {
    "dict": {"z": [0, -1, 1], "c": [1, 0, 1], "d": [-1, 1, 1], "e": [2, 2, 1]},
    "ops": [["-", "z"], [" ", "c"], ["+", "d"], [" ", "e"]]
  }], ["zce", "cde", {
    "dict": {"z": [-1, 0, 1], "c": [0, 1, 1], "d": [1, -1, 1], "e": [2, 2, 1]},
    "ops": [["+", "z"], [" ", "c"], ["-", "d"], [" ", "e"]]
  }], ["CBABAC", "ABCABBA", {
    "dict": {"AB": [0, 2, 2], "C": [2, 0, 1], "B": [5, 1, 1], "A": [6, 4, 1]},
    "ops": [["-", "AB"], [" ", "C"], ["+", "B"], [" ", "AB"], ["-", "B"], [" ", "A"], ["+", "C"]]
  }], ["aa", "aaB", {
    "dict": {"aa": [0, 0, 2], "B": [2, -1, 1]},
    "ops": [[" ", "aa"], ["-", "B"]]
  }], ["A", "B", {
    "dict": {"B": [0, -1, 1], "A": [-1, 0, 1]},
    "ops": [["-", "B"], ["+", "A"]]
  }], ["AB", "CD", {
    "dict": {"CD": [0, -1, 2], "AB": [-1, 0, 2]},
    "ops": [["-", "CD"], ["+", "AB"]]
  }], ["ABCDEF", "MNOPQRS", {
    "dict": {"MNOPQRS": [0, -1, 7], "ABCDEF": [-1, 0, 6]},
    "ops": [["-", "MNOPQRS"], ["+", "ABCDEF"]]
  }], ["asab", "saab", {
    "dict": {"a": [2, 0, 1], "sa": [0, 1, 2], "b": [3, 3, 1]},
    "ops": [["+", "a"], [" ", "sa"], ["-", "a"], [" ", "b"]]
  }], ["ab", "abab", {
    "dict": {"ab": [0, 0, 2]},
    "ops": [[" ", "ab"], ["-", "ab"]]
  }], ["bc", "c", {
    "dict": {"b": [-1, 0, 1], "c": [0, 1, 1]},
    "ops": [["+", "b"], [" ", "c"]]
  }], ["c", "bc", {
    "dict": {"b": [0, -1, 1], "c": [1, 0, 1]},
    "ops": [["-", "b"], [" ", "c"]]
  }], ["abc", "ac", {
    "dict": {"a": [0, 0, 1], "b": [-1, 1, 1], "c": [1, 2, 1]},
    "ops": [[" ", "a"], ["+", "b"], [" ", "c"]]
  }], ["ac", "abc", {
    "dict": {"a": [0, 0, 1], "b": [1, -1, 1], "c": [2, 1, 1]},
    "ops": [[" ", "a"], ["-", "b"], [" ", "c"]]
  }], ["favorite", "fervourite", {
    "dict": {
      "f": [0, 0, 1],
      "er": [1, -1, 2],
      "a": [-1, 1, 1],
      "vo": [3, 2, 2],
      "u": [5, -1, 1],
      "rite": [6, 4, 4]
    }, "ops": [[" ", "f"], ["-", "er"], ["+", "a"], [" ", "vo"], ["-", "u"], [" ", "rite"]]
  }], ["fervourite", "favorite", {
    "dict": {
      "f": [0, 0, 1],
      "a": [1, -1, 1],
      "er": [-1, 1, 2],
      "vo": [2, 3, 2],
      "u": [-1, 5, 1],
      "rite": [4, 6, 4]
    }, "ops": [[" ", "f"], ["-", "a"], ["+", "er"], [" ", "vo"], ["+", "u"], [" ", "rite"]]
  }], ["3a3a", "a", {
    "dict": {"3a3": [-1, 0, 3], "a": [0, 3, 1]},
    "ops": [["+", "3a3"], [" ", "a"]]
  }], ["aaazced", "abcdef", {
    "dict": {
      "a": [0, 0, 1],
      "b": [1, -1, 1],
      "aaz": [-1, 1, 3],
      "c": [2, 4, 1],
      "d": [3, 6, 1],
      "e": [4, 5, 1],
      "f": [5, -1, 1]
    }, "ops": [[" ", "a"], ["-", "b"], ["+", "aaz"], [" ", "c"], ["-", "d"], [" ", "e"], ["-", "f"], ["+", "d"]]
  }], ["abcdef", "aaazced", {
    "dict": {
      "a": [0, 0, 1],
      "aaz": [1, -1, 3],
      "b": [-1, 1, 1],
      "c": [4, 2, 1],
      "e": [5, 4, 1],
      "d": [6, 3, 1],
      "ef": [-1, 4, 2]
    }, "ops": [[" ", "a"], ["-", "aaz"], ["+", "b"], [" ", "c"], ["-", "e"], [" ", "d"], ["+", "ef"]]
  }], ["abcabcdef", "abcdef", {
    "dict": {"abc": [0, 0, 3], "def": [3, 6, 3]},
    "ops": [[" ", "abc"], ["+", "abc"], [" ", "def"]]
  }], ["abcdef", "abcabcdef", {
    "dict": {"abc": [0, 0, 3], "def": [6, 3, 3]},
    "ops": [[" ", "abc"], ["-", "abc"], [" ", "def"]]
  }], ["abc_abc_ef", "abc_def", {
    "dict": {"abc_": [0, 0, 4], "d": [4, -1, 1], "ef": [5, 8, 2]},
    "ops": [[" ", "abc_"], ["-", "d"], ["+", "abc_"], [" ", "ef"]]
  }], ["1abcde2", "abcde", {
    "dict": {"1": [-1, 0, 1], "2": [-1, 6, 1], "abcde": [0, 1, 5]},
    "ops": [["+", "1"], [" ", "abcde"], ["+", "2"]]
  }], ["123abcde456", "abcde", {
    "dict": {"123": [-1, 0, 3], "456": [-1, 8, 3], "abcde": [0, 3, 5]},
    "ops": [["+", "123"], [" ", "abcde"], ["+", "456"]]
  }], ["English is my favorite subject at school.", "Inglesh iz my fervourite sabject at skool.", {
    "dict": {
      "I": [0, -1, 1],
      "E": [-1, 0, 1],
      "ngl": [1, 1, 3],
      "e": [4, 21, 1],
      "i": [8, 4, 1],
      "sh i": [5, 5, 4],
      "z": [9, -1, 1],
      "s": [5, 9, 1],
      " my f": [10, 10, 5],
      "er": [15, -1, 2],
      "a": [26, 15, 1],
      "vo": [17, 16, 2],
      "u": [19, 24, 1],
      "rite s": [20, 18, 6],
      "bject at s": [27, 25, 10],
      "k": [37, -1, 1],
      "ch": [-1, 35, 2],
      "ool.": [38, 37, 4]
    },
    "ops": [["-", "I"], ["+", "E"], [" ", "ngl"], ["-", "e"], ["+", "i"], [" ", "sh i"], ["-", "z"], ["+", "s"], [" ", " my f"], ["-", "er"], ["+", "a"], [" ", "vo"], ["-", "u"], [" ", "rite s"], ["-", "a"], ["+", "u"], [" ", "bject at s"], ["-", "k"], ["+", "ch"], [" ", "ool."]]
  }], ["ivar--0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz--max", "0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz", {
    "dict": {
      "ivar--": [-1, 0, 6],
      "0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz": [0, 6, 279],
      "--max": [-1, 285, 5]
    },
    "ops": [["+", "ivar--"], [" ", "0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz"], ["+", "--max"]]
  }]];

export const testsMyers = [
  ["zc", "cd", [[-1, 0, "+", 1, "z"], [0, 1, " ", 1, "c"], [1, -1, "-", 1, "d"]]],
  ["cde", "zce", [[0, -1, "-", 1, "z"], [1, 0, " ", 1, "c"], [-1, 1, "+", 1, "d"], [2, 2, " ", 1, "e"]]],
  ["zce", "cde", [[-1, 0, "+", 1, "z"], [0, 1, " ", 1, "c"], [1, -1, "-", 1, "d"], [2, 2, " ", 1, "e"]]],
  ["CBABAC", "ABCABBA", [[0, -1, "-", 2, "AB"], [2, 0, " ", 1, "C"], [-1, 1, "+", 1, "B"], [3, 2, " ", 2, "AB"], [5, -1, "-", 1, "B"], [6, 4, " ", 1, "A"], [-1, 5, "+", 1, "C"]]],
  ["aa", "aaB", [[0, 0, " ", 2, "aa"], [2, -1, "-", 1, "B"]]],
  ["A", "B", [[0, -1, "-", 1, "B"], [-1, 0, "+", 1, "A"]]],
  ["AB", "CD", [[0, -1, "-", 2, "CD"], [-1, 0, "+", 2, "AB"]]],
  ["ABCDEF", "MNOPQRS", [[0, -1, "-", 7, "MNOPQRS"], [-1, 0, "+", 6, "ABCDEF"]]],
  ["asab", "saab", [[-1, 0, "+", 1, "a"], [0, 1, " ", 2, "sa"], [2, -1, "-", 1, "a"], [3, 3, " ", 1, "b"]]],
  ["ab", "abab", [[0, 0, " ", 2, "ab"], [2, -1, "-", 2, "ab"]]],
  ["bc", "c", [[-1, 0, "+", 1, "b"], [0, 1, " ", 1, "c"]]],
  ["c", "bc", [[0, -1, "-", 1, "b"], [1, 0, " ", 1, "c"]]],
  ["abc", "ac", [[0, 0, " ", 1, "a"], [-1, 1, "+", 1, "b"], [1, 2, " ", 1, "c"]]],
  ["ac", "abc", [[0, 0, " ", 1, "a"], [1, -1, "-", 1, "b"], [2, 1, " ", 1, "c"]]],
  ["favorite", "fervourite", [[0, 0, " ", 1, "f"], [1, -1, "-", 2, "er"], [-1, 1, "+", 1, "a"], [3, 2, " ", 2, "vo"], [5, -1, "-", 1, "u"], [6, 4, " ", 4, "rite"]]],
  ["fervourite", "favorite", [[0, 0, " ", 1, "f"], [1, -1, "-", 1, "a"], [-1, 1, "+", 2, "er"], [2, 3, " ", 2, "vo"], [-1, 5, "+", 1, "u"], [4, 6, " ", 4, "rite"]]],
  ["3a3a", "a", [[-1, 0, "+", 3, "3a3"], [2, 3, " ", 1, "a"]]],
  ["aaazced", "abcdef", [[0, 0, " ", 1, "a"], [1, -1, "-", 1, "b"], [-1, 1, "+", 3, "aaz"], [2, 4, " ", 1, "c"], [3, -1, "-", 1, "d"], [4, 5, " ", 1, "e"], [5, -1, "-", 1, "f"], [-1, 6, "+", 1, "d"]]],
  ["abcdef", "aaazced", [[0, 0, " ", 1, "a"], [1, -1, "-", 3, "aaz"], [-1, 1, "+", 1, "b"], [4, 2, " ", 1, "c"], [5, -1, "-", 1, "e"], [6, 3, " ", 1, "d"], [-1, 4, "+", 2, "ef"]]],
  ["abcabcdef", "abcdef", [[0, 0, " ", 3, "abc"], [-1, 3, "+", 3, "abc"], [3, 6, " ", 3, "def"]]],
  ["abcdef", "abcabcdef", [[0, 0, " ", 3, "abc"], [3, -1, "-", 3, "abc"], [6, 3, " ", 3, "def"]]],
  ["abc_abc_ef", "abc_def", [[0, 0, " ", 4, "abc_"], [4, -1, "-", 1, "d"], [-1, 4, "+", 4, "abc_"], [5, 8, " ", 2, "ef"]]],
  ["1abcde2", "abcde", [[-1, 0, "+", 1, "1"], [0, 1, " ", 5, "abcde"], [-1, 6, "+", 1, "2"]]],
  ["123abcde456", "abcde", [[-1, 0, "+", 3, "123"], [0, 3, " ", 5, "abcde"], [-1, 8, "+", 3, "456"]]],
  ["English is my favorite subject at school.", "Inglesh iz my fervourite sabject at skool.", [[0, -1, "-", 1, "I"], [-1, 0, "+", 1, "E"], [1, 1, " ", 3, "ngl"], [4, -1, "-", 1, "e"], [-1, 4, "+", 1, "i"], [5, 5, " ", 4, "sh i"], [9, -1, "-", 1, "z"], [-1, 9, "+", 1, "s"], [10, 10, " ", 5, " my f"], [15, -1, "-", 2, "er"], [-1, 15, "+", 1, "a"], [17, 16, " ", 2, "vo"], [19, -1, "-", 1, "u"], [20, 18, " ", 6, "rite s"], [26, -1, "-", 1, "a"], [-1, 24, "+", 1, "u"], [27, 25, " ", 10, "bject at s"], [37, -1, "-", 1, "k"], [-1, 35, "+", 2, "ch"], [38, 37, " ", 4, "ool."]]],
  ["ivar--0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz--max", "0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz", [[-1, 0, "+", 6, "ivar--"], [0, 6, " ", 279, "0abcdefghijklmnopqrstuvwxyz_1abcdefghijklmnopqrstuvwxyz_2abcdefghijklmnopqrstuvwxyz_3abcdefghijklmnopqrstuvwxyz_4abcdefghijklmnopqrstuvwxyz_5abcdefghijklmnopqrstuvwxyz_6abcdefghijklmnopqrstuvwxyz_7abcdefghijklmnopqrstuvwxyz_8abcdefghijklmnopqrstuvwxyz_9abcdefghijklmnopqrstuvwxyz"], [-1, 285, "+", 5, "--max"]]]
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
