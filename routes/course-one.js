const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", (req, res) => {
  var data = {};
  var status = 400;
  const body = req.body;
  var uuid = body.uuid;
  var course_id = body.course_id;
  var coursename;
  var username;
  // --------------------------------------------------

  var con = mysql.createConnection({
    host: "116.205.180.143",
    user: "root",
    password: "hackkk1!",
    database: "hackathon",
  });

  con.connect(function (err) {
    if (err) {
      console.log("courseone:");
      console.log(err);
      res.send(500).send(err);
      return;
    } else {
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
        .catch((err) => {});
      let coursePromise = new Promise((resolve, reject) => {
        var sql = `SELECT coursename FROM courses WHERE course = '${course_id}' AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
        con.query(sql, function (err, result) {
          // console.log(result);
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
      coursePromise
        .then((result) => {
          coursename = result[0]["coursename"];
          // console.log(username);
          var sql1 = `SELECT * from requests WHERE course = '${course_id}' AND tutee = '${username}';`;
          con.query(sql1, function (err, result) {
            // console.log(username);
            // console.log(result);
            if (err) {
              status = 500;
              data = err;
            } else if (result) {
              // console.log(1);
              // console.log(result);
              status = 200;
              var tempData = {};
              result.map((item) => {
                if (tempData[item["requestid"]] == undefined) {
                  tempData[item["requestid"]] = {};
                  tempData[item["requestid"]]["requestid"] = item["requestid"];
                  tempData[item["requestid"]]["school_id"] = item["school_id"];
                  tempData[item["requestid"]]["school_name"] = item["school"];
                  tempData[item["requestid"]]["course_id"] = item["course_id"];
                  tempData[item["requestid"]]["tutor"] = undefined;
                  tempData[item["requestid"]]["tutee"] = item["tutee"];
                  tempData[item["requestid"]]["tutor_in_line"] = [];
                }
                if (
                  tempData[item["requestid"]]["tutor"] == undefined &&
                  item["tutor"] != undefined
                ) {
                  tempData[item["requestid"]]["tutor"] = item["tutor"];
                }
                if (
                  tempData[item["requestid"]]["tutor_in_line"].includes(
                    item["tutor_in_line"]
                  ) == false &&
                  item["tutor_in_line"] != null
                ) {
                  tempData[item["requestid"]]["tutor_in_line"].push(
                    item["tutor_in_line"]
                  );
                }
              });
              // console.log(tempData);
              data["tutor-in-line"] = [];
              for (const [key, value] of Object.entries(tempData)) {
                // console.log(value);
                data["tutor-in-line"].concat(value["tutor_in_line"]);
              }
              data["course_id"] = course_id;
              data["name"] = coursename;
            }
            res.status(status);
            res.send(data);
          });
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    }
  });
});

module.exports = router;
