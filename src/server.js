let mysql = require('mysql');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
const secrets = require('../src/Secrets.js');
const url = require('url');

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

let urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // for reading JSON
let util = require('util'); // for async calls
const query = util.promisify(conn.query).bind(conn);


let server = app.listen(8080, function () {
    let host = server.address().address
    let port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})

app.get('/getusercities', function (req, res) {
    const username = req.body.username;
    console.log("username: ", username);
    const sql1 = "SELECT user_id FROM user WHERE username=?";
    const sql2 = "SELECT name FROM city WHERE user_id=?";

    (async () =>  {
        try {
            const result = await query(sql1, [username]);
            const result2 = await query(sql2, [result[0].user_id]);
            res.send(result2[0]);
        } catch (e) {
            console.log("Database error!"+ e);
        }
    })()
})

app.post('/savecity', function (req, res) {
    const city = req.body.city;
    const userid = req.body.userid;

    const sql = "INSERT INTO city (name, user_id) VALUES (?, ?)";

    (async () => {
        await query(sql, [city, userid]);
        res.send("Saved:" + city + ", " + userid);
    })()
})

app.post('/searchuser', urlencodedParser, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const hashedpassword = bcrypt.hashSync(password, 10);
    let sql;
    let result;

    (async () => {
        try {
            sql = "SELECT * FROM user WHERE username = ?";
            result = await query(sql, [username]);
            if (result.length === 0) { //User not found, creating a new user.
                sql = "INSERT INTO user (username, password) VALUES (?, ?)";
                result = await query(sql, [username, hashedpassword]);
                res.status(201).send("New account created.");
            } else {
                sql = "SELECT password FROM user WHERE username = ?";
                result = await query(sql, [username]);
                const resultpassword = result[0].password;
                bcrypt.compare(password, resultpassword, function (err, comparisonresponse) {
                    if (err) {
                        console.log("Error in comparing passwords: ", err);
                    }
                    if (comparisonresponse) {
                        const accesstoken = jwt.sign({username: username}, secrets.jwtSecret,
                            {expiresIn: "1h"})
                        res.status(202).json({accessToken: accesstoken})
                    } else {
                        res.status(203).send("Password incorrect.");
                    }
                })
            }
        } catch (e) {
            console.log("Database error!"+ e);
        }
    })()


})

