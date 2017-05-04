var sk = require("scikit-node");
console.log(sk)

var samples = [[0, 0, 2], [1, 0, 0], [0, 0, 1]];

var methods = [
    ["fit", samples],
    ["kneighbors", [0, 0, 1.3]]
];

sk.SKLearn("neighbors", ["NearestNeighbors", 5], methods, (results) => {
    console.log(results);
});

//var nn = require("nearest-neighbor");

//var items = [
  //{ name: "Bill", age: 10, pc: "Mac", ip: "68.23.13.8" },
  //{ name: "Alice", age: 22, pc: "Windows", ip: "193.186.11.3" },
  //{ name: "Bob", age: 12, pc: "Windows", ip: "56.89.22.1" }
//];

//var query = { name: "Bob", age: 12, pc: "Windows", ip: "68.23.13.10" };

//var fields = [
    //{ name: "name", measure: nn.comparisonMethods.word },
    //{ name: "age", measure: nn.comparisonMethods.number, max: 100 },
    //{ name: "pc", measure: nn.comparisonMethods.word },
    //{ name: "ip", measure: nn.comparisonMethods.ip }
//];

//nn.findMostSimilar(query, items, fields, function(nearestNeighbor, probability) {
    //console.log(query);
    //console.log(nearestNeighbor);
    //console.log(probability);
//});
