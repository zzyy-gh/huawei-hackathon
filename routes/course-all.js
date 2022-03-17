const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", (req, res) => {
  var data = [];
  var status = 400;
  const body = req.body;
  var uuid = body.uuid;
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
      console.log("courseall:");
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
        var sql = `SELECT * FROM courses WHERE EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
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
          result.map((item) => {
            obj = {
              course_id: item["course"],
              name: item["coursename"],
            };
            data.push(obj);
          });
          var sql1 = `SELECT * from requests WHERE tutee = '${username}';`;
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
                if (tempData[item["course_id"]] == undefined) {
                  tempData[item["course_id"]] = {};
                  tempData[item["course_id"]]["requestid"] = item["requestid"];
                  tempData[item["course_id"]]["school_id"] = item["school_id"];
                  tempData[item["course_id"]]["school_name"] = item["school"];
                  tempData[item["course_id"]]["course_id"] = item["course_id"];
                  tempData[item["course_id"]]["course"] = item["course"];
                  tempData[item["course_id"]]["tutor"] = undefined;
                  tempData[item["course_id"]]["tutee"] = item["tutee"];
                  tempData[item["course_id"]]["tutor_in_line"] = [];
                }
                if (
                  tempData[item["course_id"]]["tutor"] == undefined &&
                  item["tutor"] != undefined
                ) {
                  tempData[item["course_id"]]["tutor"] = item["tutor"];
                }
                if (
                  tempData[item["course_id"]]["tutor_in_line"].includes(
                    item["tutor_in_line"]
                  ) == false &&
                  item["tutor_in_line"] != null
                ) {
                  tempData[item["course_id"]]["tutor_in_line"].push(
                    item["tutor_in_line"]
                  );
                }
              });
              // console.log(tempData);
              data.map((course) => {
                course["tutor_in_line"] = [];
                if (tempData[course["course_id"]] != undefined) {
                  course["tutor_in_line"] =
                    tempData[course["course_id"]]["tutor_in_line"];
                }
              });
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
