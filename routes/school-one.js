const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", (req, res) => {
  var data = {};
  var status = 400;
  const body = req.body;
  var uuid = body.uuid;
  var school_id = body.school_id;
  // --------------------------------------------------

  var con = mysql.createConnection({
    host: "116.205.180.143",
    user: "root",
    password: "hackkk1!",
    database: "hackathon",
  });

  con.connect(function (err) {
    if (err) {
      console.log("schoolone:");
      console.log(err);
      res.send(500).send(err);
      return;
    } else {
      var sql = `SELECT * from schools WHERE school_id = '${school_id}' AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
      con.query(sql, function (err, result) {
        if (err) {
          status = 500;
          data = err;
        } else if (result && result.length != 0) {
          // console.log(1);
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
          // console.log(2);
          status = 200;
        }
        res.status(status);
        res.send(data);
      });
    }
  });
});

module.exports = router;
