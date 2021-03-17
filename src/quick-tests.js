"use strict";
exports.__esModule = true;
var SIZE = 100000;
var matrixInMemory = 0;
var fillMatrix = function (rows, columns, fill) {
    console.log("Start FILL");
    var a = [];
    for (var i = 0; i < rows; i++) {
        a.push([]);
        for (var j = 0; j < columns; j++) {
            a[i].push(fill);
        }
    }
    matrixInMemory++;
    console.log("Finish FILL");
    return a;
};
var multiplyMatrix = function (a, b) {
    console.log("Start MULTIPLY");
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < a[i].length; j++) {
            a[i][j] *= b[i][j];
        }
    }
    console.log("Finish MULTIPLY");
    // force GC?
    b = [];
    matrixInMemory--;
    return a;
};
var sumMatrix = function (a, b) {
    console.log("Start SUM");
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < a[0].length; j++) {
            a[i][j] += b[i][j];
        }
    }
    // force GC?
    b = [];
    matrixInMemory--;
    console.log("Finish SUM");
    return a;
};
// const calcRecursiveOld = (config: Config): number[][] => {
//   switch (config.type) {
//     case "sum":
//       return config.input ? sumMatrix(calcRecursiveOld(config.input[0]), calcRecursiveOld(config.input[1])) : []
//     case "multiply":
//       return config.input ? multiplyMatrix(calcRecursiveOld(config.input[0]), calcRecursiveOld(config.input[1])) : []
//     case "fill":
//       return fillMatrix(SIZE, SIZE, config.value ?? 0)
//   }
// }
exports.calcRecursive = function (config) {
    // First do functions
    console.log("In memory: " + matrixInMemory);
    if (isFunction(config)) {
        return calcFunction(config);
    }
    else {
        return calcTerminal(config);
    }
};
var calcFunction = function (config) {
    var left;
    var right;
    if (isFunction(config.input[0])) {
        left = exports.calcRecursive(config.input[0]);
        right = exports.calcRecursive(config.input[1]);
    }
    else {
        right = exports.calcRecursive(config.input[1]);
        left = exports.calcRecursive(config.input[0]);
    }
    switch (config.type) {
        case "sum":
            return config.input ? sumMatrix(left, right) : [];
        case "multiply":
            return config.input ? multiplyMatrix(left, right) : [];
    }
    throw Error("Can not happen");
};
var calcTerminal = function (config) {
    var _a;
    switch (config.type) {
        case "fill":
            return fillMatrix(SIZE, SIZE, (_a = config.value, (_a !== null && _a !== void 0 ? _a : 0)));
    }
    throw Error("CAN NOT HAPPEN");
};
var terminals = ["fill"];
var isFunction = function (config) { return terminals.indexOf(config.type) === -1; };
exports.config = {
    type: "sum",
    input: [
        {
            type: "sum",
            input: [{
                    type: "fill",
                    value: 9
                }, {
                    type: "sum",
                    input: [{
                            type: "fill",
                            value: 3
                        }, {
                            type: "multiply",
                            input: [{
                                    type: "fill",
                                    value: 4
                                }, {
                                    type: "sum",
                                    input: [{
                                            type: "fill",
                                            value: 9
                                        }, {
                                            type: "fill",
                                            value: 5
                                        }]
                                }]
                        }]
                }]
        },
        {
            type: "sum",
            input: [{
                    type: "sum",
                    input: [
                        {
                            type: "sum",
                            input: [{
                                    type: "fill",
                                    value: 9
                                }, {
                                    type: "sum",
                                    input: [{
                                            type: "fill",
                                            value: 3
                                        }, {
                                            type: "multiply",
                                            input: [{
                                                    type: "fill",
                                                    value: 4
                                                }, {
                                                    type: "sum",
                                                    input: [{
                                                            type: "fill",
                                                            value: 9
                                                        }, {
                                                            type: "fill",
                                                            value: 5
                                                        }]
                                                }]
                                        }]
                                }]
                        }, {
                            type: "multiply",
                            input: [{
                                    type: "fill",
                                    value: 4
                                }, {
                                    type: "sum",
                                    input: [{
                                            type: "fill",
                                            value: 9
                                        }, {
                                            type: "fill",
                                            value: 5
                                        }]
                                }]
                        }
                    ]
                }, {
                    type: "fill",
                    value: 3
                }]
        }
    ]
};
var measure = function (times, fn) {
    var t = performance.now();
    for (var i = 0; i < times; i++) {
        fn();
    }
    var tFinished = performance.now();
    console.log("Time ran is " + (tFinished - t));
};
// measure(1, () => calcRecursive(config));
// measure(1, () => testArraySum());
