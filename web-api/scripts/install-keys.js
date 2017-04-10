var AWS = require("aws-sdk");
var fs = require("fs");
var s3 = new AWS.S3();

var bucket = "argos-capstone";
var keys = ["admin-key.json", "client-key.json"];

keys.forEach((k) => {
    s3.getObject({
        Bucket: bucket,
        Key: k
    }, (err, data) => {
        if (err) console.log(err);

        if (data) {
            fs.writeFile(`./keystore/${k}`, data.Body, (err) => {
                if (err) console.log(err);
            });
        }
    });
})
