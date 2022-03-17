const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = {};
  var status = 400;
  const body = req.body;
  var firstname = body.firstname;
  var lastname = body.lastname;
  var school_id = body.school_id;
  var courses = body.courses;
  var phone = body.phone;
  var username = body.username;
  var password = body.password;
  // --------------------------------------------------
  // todo: add duplicate filter
  var con = mysql.createConnection({
    host: "116.205.180.143",
    user: "root",
    password: "hackkk1!",
    database: "hackathon",
  });
  let promises = [];

  con.connect(function (err) {
    if (err) {
      console.log("register:");
      console.log(err);
      res.send(500).send(err);
      return;
    } else {
      let myPromise = new Promise((resolve, reject) => {
        const sql0 = `SELECT * FROM users WHERE username = '${username}';`;
        con.query(sql0, function (err, result) {
          resolve(result);
        });
      });
      myPromise.then((result) => {
        if (result && result.length != 0) {
          status = 400;
          data = {
            message: "Username already exists.",
          };
          res.status(status);
          res.send(data);
        } else {
          if (!courses || courses.length == 0) {
            var sql = `INSERT INTO users (uuid, username, firstname, lastname, school_id, phone, password) VALUES (${uuid}, '${username}', '${firstname}', '${lastname}', '${school_id}', '${phone}', '${password}');`;
            const myPromise = new Promise(function (myResolve, myReject) {
              con.query(sql, function (err, result) {
                if (err) {
                  status = 500;
                  data = err;
                } else {
                  status = 200;
                  // console.log(`Username ${username} is added with course ${course}.`);
                  myResolve(); // when successful
                  myReject(); // when error
                }
              });
            });
            promises.push(myPromise);
          } else {
            courses.map((course, i) => {
              const uuid = Date.now() + i;
              // console.log(uuid);
              var sql = `INSERT INTO users (uuid, username, firstname, lastname, school_id, phone, password, course) VALUES (${uuid}, '${username}', '${firstname}', '${lastname}', '${school_id}', '${phone}', '${password}', '${course}');`;
              const myPromise = new Promise(function (myResolve, myReject) {
                con.query(sql, function (err, result) {
                  if (err) {
                    status = 500;
                    data = err;
                  } else {
                    status = 200;
                    // console.log(`Username ${username} is added with course ${course}.`);
                    myResolve(); // when successful
                    myReject(); // when error
                  }
                });
              });
              promises.push(myPromise);
            });
          }

          Promise.all(promises).then(() => {
            // console.log("All items are added.");
            res.status(status);
            res.send(data);
          });
        }
      });
    }
  });
});

module.exports = router;
