const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = {};
  var status = 200;
  const body = req.body;
  var uuid = body.uuid;
  var school_id = body.school_id;
  var courses = body.courses;
  var school;
  var username;
  var course_list = [];
  coursePromises = [];
  reqPromises = [];

  console.log("sr: ", body);

  // --------------------------------------------------

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
    const schoolPromise = new Promise((resolve, reject) => {
      var sql = `SELECT school FROM schools WHERE school_id = '${school_id}' AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
      con.query(sql, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    await schoolPromise
      .then((result) => {
        if (result && result.length != 0) {
          school = result[0]["school"];
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
      coursePromises.push(coursePromise);
    });

    await Promise.all(coursePromises)
      .then((result) => {
        if (result && result.length != 0) {
          // console.log(r);
          result.map((item) => {
            const obj = {
              course: item[0]["course"],
              coursename: item[0]["coursename"],
            };
            course_list.push(obj);
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
      reqPromises.push(requestPromise);
    });

    await Promise.all(reqPromises).catch((err) => {
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
