const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = {};
  var status = 200;
  const body = req.body;
  var uuid = body.uuid;
  var requestid = body.requestid;
  var tutor = body.tutor;
  const id = Date.now();
  var username;
  var school_id;
  var school;
  var course;
  var course_id;
  var tutee;
  // --------------------------------------------------
  console.log("ct: ", body);

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
    const reqPromise1 = new Promise((resolve, reject) => {
      var sql = `SELECT * FROM requests WHERE requestid = ${requestid} AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
      con.query(sql, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    await reqPromise1
      .then((result) => {
        if (result && result.length != 0) {
          school_id = result[0]["school_id"];
          school = result[0]["school"];
          course_id = result[0]["course_id"];
          course = result[0]["course"];
          tutee = result[0]["tutee"];
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
    const reqPromise2 = new Promise((resolve, reject) => {
      var sql = `INSERT INTO requests (uuid, requestid, school_id, school, course_id, course, tutee, tutor) VALUES (${id}, ${requestid}, '${school_id}', '${school}', '${course_id}', '${course}', '${tutee}', '${tutor}');`;
      con.query(sql, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    await reqPromise2.catch((err) => {
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
