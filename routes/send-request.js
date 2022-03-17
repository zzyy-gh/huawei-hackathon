const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", (req, res) => {
  var data = {};
  var status = 400;
  const body = req.body;
  var uuid = body.uuid;
  var school_id = body.school_id;
  var courses = body.courses;
  var school;
  var username;
  var course_list = [];
  promises1 = [];
  promises2 = [];
  // --------------------------------------------------

  var con = mysql.createConnection({
    host: "116.205.180.143",
    user: "root",
    password: "hackkk1!",
    database: "hackathon",
  });

  con.connect(function (err) {
    if (err) {
      console.log("sendrequest:");
      console.log(err);
      res.send(500).send(err);
      return;
    } else {
      let schoolPromise = new Promise((resolve, reject) => {
        var sql = `SELECT school FROM schools WHERE school_id = '${school_id}' AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
        con.query(sql, function (err, result) {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
      schoolPromise
        .then((result) => {
          school = result[0]["school"];
        })
        .catch((err) => {
          res.status(500).send(err);
          return;
        });

      let userPromise = new Promise((resolve, reject) => {
        var sql = `SELECT username FROM users WHERE uuid = ${uuid} AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
        con.query(sql, function (err, result) {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
      userPromise
        .then((result) => {
          username = result[0]["username"];
        })
        .catch((err) => {
          res.status(500).send(err);
          return;
        });

      courses.map((course_id) => {
        let coursePromise = new Promise((resolve, reject) => {
          var sql = `SELECT * FROM courses WHERE course = '${course_id}' AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
          con.query(sql, function (err, result) {
            if (err) {
              reject(err);
            }
            resolve(result);
          });
        });
        promises1.push(coursePromise);
      });

      Promise.all(promises1)
        .then((r) => {
          // console.log(r);
          r.map((item) => {
            const obj = {
              course: item[0]["course"],
              coursename: item[0]["coursename"],
            };
            course_list.push(obj);
          });
          // console.log(course_list);
          course_list.map((item, i) => {
            // console.log(item);
            let requestPromise = new Promise((resolve, reject) => {
              const requestid = Date.now() + i;
              var sql = `INSERT INTO requests (uuid, requestid, school_id, school, course_id, course, tutor, tutee, tutor_in_line) VALUES (${requestid}, ${requestid}, '${school_id}', '${school}', '${item["course"]}', '${item["coursename"]}', NULL, '${username}', NULL);`;
              con.query(sql, function (err, result) {
                if (err) {
                  reject(err);
                }
                resolve(result);
              });
            });
            promises2.push(requestPromise);
          });

          Promise.all(promises2)
            .then(() => {
              // console.log("All items are added.");
              res.status(200);
              res.send(data);
            })
            .catch((err) => {
              res.status(500).send(err);
              return;
            });
        })
        .catch((err) => {
          res.status(500).send(err);
          return;
        });
    }
  });
});

module.exports = router;
