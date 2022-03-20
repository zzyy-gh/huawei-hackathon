const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = [];
  var status = 200;
  const body = req.body;
  var uuid = body.uuid;
  var courses = body.courses;
  var coursePromises = [];
  // --------------------------------------------------
  console.log("crfm: ", body);

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
    courses.map((course) => {
      var sql = `SELECT * from requests WHERE course_id = '${course}' AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
      const myPromise = new Promise(function (myResolve, myReject) {
        con.query(sql, function (err, result) {
          if (err) {
            myReject(err); // when error
          } else {
            // console.log(`Username ${username} is added with course ${course}.`);
            myResolve(result); // when successful
          }
        });
      });
      coursePromises.push(myPromise);
    });

    await Promise.all(coursePromises)
      .then((r) => {
        // console.log(r);
        result = [];
        r.map((item) => {
          result = result.concat(item);
        });
        if (result && result.length != 0) {
          // console.log(1);
          // console.log(result);
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
          var tempData1 = {};
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
            if (tempData1[value["course_id"]] == undefined) {
              tempData1[value["course_id"]] = [];
            }
            tempData1[value["course_id"]].push(obj);
          }
          for (const [key, value] of Object.entries(tempData1)) {
            const obj = {
              course_id: key,
              requests: [],
            };
            value.map((item) => {
              if (item["tutor"] == undefined) {
                obj["requests"].push(item);
              }
            });
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
