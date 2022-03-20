const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = {};
  var status = 200;
  const body = req.body;
  var firstname = body.firstname;
  var lastname = body.lastname;
  var school_id = body.school_id;
  var courses = body.courses;
  var phone = body.phone;
  var username = body.username;
  var password = body.password;
  let userPromises = [];
  // --------------------------------------------------
  console.log("r: ", body);

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
      var sql = `SELECT * FROM users WHERE username = '${username}';`;
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
        if (result.length > 0) {
          status = 400;
          data = { message: "Username already exists." };
        }
      })
      .catch((err) => {
        data = err;
        status = 500;
      });
  }

  if (status === 200) {
    if (!courses || courses.length == 0) {
      const userPromise = new Promise((resolve, reject) => {
        const uuid = Date.now();
        var sql = `INSERT INTO users (uuid, username, firstname, lastname, school_id, phone, password) VALUES (${uuid}, '${username}', '${firstname}', '${lastname}', '${school_id}', '${phone}', '${password}');`;
        con.query(sql, function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      await userPromise.catch((err) => {
        data = err;
        status = 500;
      });
    } else {
      courses.map((course, i) => {
        let userPromise = new Promise((resolve, reject) => {
          const uuid = Date.now() + i;
          // console.log(uuid);
          var sql = `INSERT INTO users (uuid, username, firstname, lastname, school_id, phone, password, course) VALUES (${uuid}, '${username}', '${firstname}', '${lastname}', '${school_id}', '${phone}', '${password}', '${course}');`;
          con.query(sql, function (err, result) {
            if (err) {
              reject(err);
            }
            resolve(result);
          });
        });
        userPromises.push(userPromise);
      });

      await Promise.all(userPromises).catch((err) => {
        data = err;
        status = 500;
      });
    }
  }

  console.log(data);
  con.destroy();
  res.status(status).send(data);
  return;
});

module.exports = router;
