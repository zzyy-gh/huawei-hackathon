const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = [];
  var status = 200;
  const body = req.body;
  var uuid = body.uuid;
  var coursename;
  var username;
  // --------------------------------------------------
  console.log("ca: ", body);

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
    const coursePromise = new Promise((resolve, reject) => {
      var sql = `SELECT * FROM courses WHERE EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
      con.query(sql, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    await coursePromise
      .then((result) => {
        if (result && result.length != 0) {
          result.map((item) => {
            obj = {
              course_id: item["course"],
              name: item["coursename"],
            };
            data.push(obj);
          });
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
    const requestPromise = new Promise((resolve, reject) => {
      var sql = `SELECT * from requests WHERE tutee = '${username}';`;
      con.query(sql, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    await requestPromise
      .then((result) => {
        if (result && result.length != 0) {
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
