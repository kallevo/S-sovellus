let mysql = require('mysql');
let express = require('express');
let app = express();

/**
 * Luodaan yhteys.
 * @type {Connection}
 */
const conn = mysql.createConnection({
    host: "mysql.metropolia.fi",
    user: "pasiisa",
    password: "weatherapp",
    database: "pasiisa"
});

/**
 * Yhdistetaan MySQL:aan.
 */
conn.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL!");
});

let server = app.listen(8080, function () {
    let host = server.address().address
    let port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})

