const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", (req, res) => {
  var data = {};
  var status = 400;
  const body = req.body;
  var uuid = body.uuid;
  var username = body.username;
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
      var sql = `SELECT * from users WHERE username = '${username}' AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
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
          let schoolPromise = new Promise((resolve, reject) => {
            var sql = `SELECT school from schools WHERE school_id = '${data["school_id"]}';`;
            con.query(sql, function (err, result) {
              if (err) {
                reject(err);
              }
              resolve(result);
            });
          });
          schoolPromise
            .then((result) => {
              data["school_name"] = result[0]["school"];
              res.status(200);
              res.send(data);
              return;
            })
            .catch((err) => {
              res.status(500).send(err);
              return;
            });
        } else {
          res.status(500).send({});
          return;
        }
      });
    }
  });
});

module.exports = router;
