var fs = require("fs");

var bucket = "argos-capstone";
var keys = ["admin-key.json", "client-key.json"];

var ks = process.env.KEYSTORE || "../keystore";

fs.readdir("/app", function(err, items) {
    console.log(items);
});

var promises = keys.map((k) => {
    s3.getObject({
        Bucket: bucket,
        Key: k
    }, (err, data) => {
        if (err) console.log(err);

        if (data) {
            var noExt = k.split(".")[0];
            process.env[noExt] = String(data.Body);
            //fs.writeFile(`${ks}/${k}`, data.Body, (err) => {
                //if (err) console.log(err);
            //});
        }
    });
})
