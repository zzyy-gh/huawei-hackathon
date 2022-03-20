const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = {};
  var status = 200;
  const body = req.body;
  var username = body.username;
  var password = body.password;
  // --------------------------------------------------
  console.log("l: ", body);

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
      var sql = `select users.uuid, username, firstname, lastname, users.school_id, school AS school_name, users.course from users left join schools on users.school_id = schools.school_id WHERE username = '${username}' AND password='${password}';`;
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
          status = 200;
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
          status = 400;
          data = { message: "Invalid username or password" };
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
