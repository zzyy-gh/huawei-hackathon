const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", (req, res) => {
  var data = {};
  var status = 400;
  const body = req.body;
  var uuid = body.uuid;
  var requestid = body.requestid;
  // --------------------------------------------------

  var con = mysql.createConnection({
    host: "116.205.180.143",
    user: "root",
    password: "hackkk1!",
    database: "hackathon",
  });

  con.connect(function (err) {
    if (err) {
      console.log("deletereq:");
      console.log(err);
      res.send(500).send(err);
      return;
    } else {
      var sql = `DELETE FROM requests WHERE requestid = ${requestid} AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
      con.query(sql, function (err, result) {
        if (err) {
          status = 500;
          data = err;
        } else {
          status = 200;
        }
        res.status(status);
        res.send(data);
      });
    }
  });
});

module.exports = router;
