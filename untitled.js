
var http = require('http');

function getJSONSTUFF( eventCallback) {
    var url = "www.utexas.io/users";

    http.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            console.log(res);
            console.log(body);
            var stringResult = JSON.parse(body);
            eventCallback(stringResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

getJSONSTUFF(function(stuff) {
    console.log(stuff);
});