const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", (req, res) => {
  var data = {};
  var status = 400;
  const body = req.body;
  var username = body.username;
  var password = body.password;
  // --------------------------------------------------

  var con = mysql.createConnection({
    host: "116.205.180.143",
    user: "root",
    password: "hackkk1!",
    database: "hackathon",
  });

  con.connect(function (err) {
    if (err) {
      status = 500;
      data = err;
    } else {
      var sql = `select users.uuid, username, firstname, lastname, users.school_id, school AS school_name, users.course from users left join schools on users.school_id = schools.school_id WHERE username = '${username}' AND password='${password}';`;
      con.query(sql, function (err, result) {
        if (err) {
          status = 500;
          data = err;
        } else if (result && result.length != 0) {
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
          data = {
            message: "Invalid username or password",
          };
        }
        // --------------------------------------------------
        res.status(status);
        res.send(data);
      });
    }
  });
});

module.exports = router;
