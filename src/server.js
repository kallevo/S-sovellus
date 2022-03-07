let mysql = require('mysql');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
const secrets = require('../src/Secrets.js');
const cors = require('cors');

const corsOptions = {
    origin: '*',
}

app.use(cors(corsOptions))

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
conn.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL!");
});

let urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); // for reading JSON
let util = require('util'); // for async calls
const query = util.promisify(conn.query).bind(conn);


let server = app.listen(8080, function () {
    let host = server.address().address
    let port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})

app.post('/getusercities', function (req, res) {
    const username = req.body.username;
    console.log("username: ", username);
    const sql1 = "SELECT user_id FROM user WHERE username=?";
    const sql2 = "SELECT * FROM city WHERE user_id=?";

    (async () => {
        try {
            const result = await query(sql1, [username]);
            const result2 = await query(sql2, [result[0].user_id]);
            res.status(201).send(result2);
        } catch (e) {
            res.status(401).send("Could not get saved cities. Try again.");
            console.log("Database error!" + e);
        }
    })()
})

app.post('/savecity', function (req, res) {
    const city = req.body.city;
    const username = req.body.username;

    const sql1 = "SELECT user_id FROM user WHERE username=?";
    const sql2 = "INSERT INTO city (name, user_id) VALUES (?, ?)";

    (async () => {
        try {
            const result = await query(sql1, [username]);
            await query(sql2, [city, result[0].user_id]);
            res.status(201).send("City saved successfully: " + city);
        } catch (e) {
            res.status(401).send("City save failed. Try again.");
            console.log("Database error!" + e);
        }
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
            console.log("Database error!" + e);
        }
    })() 
})

app.post('/remove', function (req, res) {
    const saveid = req.body.save_id;
    const sql1 = "DELETE FROM city WHERE save_id=?";

    (async () => {
        try {
            console.log("removing saveid:" + saveid)
            await query(sql1, [saveid]);
            res.status(201).send("saved city removed");
        } catch (e) {
            res.status(401).send("City removal failed. Try again.");
            console.log("Database error!" + e);
        }
    })()
})

app.get("/verifytoken", function(req, res) {
    const authHeader = req.header('authorization');
    const token = authHeader && authHeader.split(' ')[1]
    console.log("token: ", token)
    if (token === null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secrets.jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).send("Verification of token failed.");
        } else if (err === null) {
            return res.status(202).send(req.body);
        }
        req.user = user;
        console.log("user (decoded) " + JSON.stringify(user));
    })
})