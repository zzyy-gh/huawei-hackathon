const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", (req, res) => {
  var data = [];
  var status = 400;
  const body = req.body;
  var uuid = body.uuid;
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
      console.log("checkrequestsent:");
      console.log(err);
      res.send(500).send(err);
      return;
    } else {
      let userPromise = new Promise((resolve, reject) => {
        var sql = `SELECT username FROM users WHERE uuid = ${uuid} AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
        con.query(sql, function (err, result) {
          // console.log(result);
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
      userPromise
        .then((result) => {
          username = result[0]["username"];
          // console.log(username);
          var sql1 = `SELECT * from requests WHERE tutee = '${username}';`;
          con.query(sql1, function (err, result) {
            // console.log(username);
            // console.log(result);
            if (err) {
              status = 500;
              data = err;
            } else if (result && result.length != 0) {
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
              for (const [key, value] of Object.entries(tempData)) {
                // console.log(value);
                const obj = {
                  requestid: value["requestid"],
                  school_id: value["school_id"],
                  school_name: value["school_name"],
                  course_id: value["course_id"],
                  tutor: value["tutor"],
                  tutee: value["tutee"],
                  tutor_in_line: value["tutor_in_line"],
                };
                data.push(obj);
              }
            } else {
              // console.log(2);
              status = 200;
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
