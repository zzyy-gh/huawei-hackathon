const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = [];
  var status = 200;
  const body = req.body;
  var uuid = body.uuid;
  var username;
  // --------------------------------------------------
  console.log("ctr: ", body);

  var con = mysql.createConnection({
    host: "116.205.180.143",
    user: "root",
    password: "hackkk1!",
    database: "hackathon",
  });

  // connect
  const conPromise = new Promise((resolve, reject) => {
    con.connect(async function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  await conPromise.catch((err) => {
    data = err;
    status = 500;
  });

  if (status === 200) {
    const userPromise = new Promise((resolve, reject) => {
      var sql = `SELECT username FROM users WHERE uuid = ${uuid} AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
      con.query(sql, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    await userPromise
      .then((result) => {
        if (result && result.length != 0) {
          username = result[0]["username"];
        } else {
          status = 404;
        }
      })
      .catch((err) => {
        data = err;
        status = 500;
      });
  }
  if (status === 200) {
    const reqPromise = new Promise((resolve, reject) => {
      var sql = `SELECT * from requests WHERE tutor_in_line = '${username}' OR tutor = '${username}';`;
      con.query(sql, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    await reqPromise
      .then((result) => {
        if (result && result.length != 0) {
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
          status = 404;
        }
      })
      .catch((err) => {
        data = err;
        status = 500;
      });
  }

  console.log(data);
  con.destroy();
  res.status(status).send(data);
  return;
});

module.exports = router;
