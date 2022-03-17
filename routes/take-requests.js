const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", (req, res) => {
  var data = {};
  var status = 400;
  const body = req.body;
  var uuid = body.uuid;
  var requestid = body.requestid;
  const id = Date.now();
  var username;
  var school_id;
  var school;
  var course;
  var course_id;
  var tutee;
  // --------------------------------------------------

  var con = mysql.createConnection({
    host: "116.205.180.143",
    user: "root",
    password: "hackkk1!",
    database: "hackathon",
  });

  con.connect(function (err) {
    if (err) {
      status = 500;
      data = err;
    } else {
      let userPromise = new Promise((resolve, reject) => {
        var sql = `SELECT username FROM users WHERE uuid = ${uuid} AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
        con.query(sql, function (err, result) {
          if (err) {
            res.send(err);
          }
          resolve(result);
        });
      });
      userPromise.then((result) => {
        username = result[0]["username"];
      });
      let reqPromise = new Promise((resolve, reject) => {
        var sql = `SELECT * FROM requests WHERE requestid = ${requestid} AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
        con.query(sql, function (err, result) {
          if (err) {
            res.status(500);
            res.send(err);
            reject();
          }
          resolve(result);
        });
      });
      reqPromise
        .then((result) => {
          if (result && result.length != 0) {
            school_id = result[0]["school_id"];
            school = result[0]["school"];
            course_id = result[0]["course_id"];
            course = result[0]["course"];
            tutee = result[0]["tutee"];
            var sql = `INSERT INTO requests (uuid, requestid, school_id, school, course_id, course, tutee, tutor) VALUES (${id}, ${requestid}, '${school_id}', '${school}', '${course_id}', '${course}', '${tutee}', '${username}');`;
            con.query(sql, function (err, result) {
              if (err) {
                status = 500;
                data = err;
              } else {
                status = 200;
              }
              res.status(status);
              res.send(data);
            });
          } else {
            res.status(400);
            res.send(data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});

module.exports = router;
