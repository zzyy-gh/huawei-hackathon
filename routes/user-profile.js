const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = {};
  var status = 200;
  const body = req.body;
  var uuid = body.uuid;
  var username = body.username;

  console.log("up: ", body);

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
    // queries

    // get user profile
    const userPromise = new Promise((resolve, reject) => {
      var sql = `SELECT * from users WHERE username = '${username}' AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
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
          // console.log(result);
          data = result[0];
          data["courses"] = [];
          result.map((user) => {
            if (
              (data["courses"].includes(user["course"]) == false ||
                data["courses"].length == 0) &&
              user["course"] != null
            ) {
              data["courses"].push(user["course"]);
            }
          });
          delete data["course"];
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
    let schoolPromise = new Promise((resolve, reject) => {
      var sql = `SELECT school from schools WHERE school_id = '${data["school_id"]}';`;
      con.query(sql, function (err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
    await schoolPromise
      .then((result) => {
        if (result && result.length != 0) {
          data["school_name"] = result[0]["school"];
          // console.log(data);
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
