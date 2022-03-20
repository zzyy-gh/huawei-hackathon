const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = {};
  var status = 200;
  const body = req.body;
  var uuid = body.uuid;
  var requestid = body.requestid;
  // --------------------------------------------------
  console.log("dr: ", body);

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
      var sql = `DELETE FROM requests WHERE requestid = ${requestid} AND EXISTS (SELECT uuid FROM users WHERE uuid = ${uuid});`;
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
  }

  console.log(data);
  con.destroy();
  res.status(status).send(data);
  return;
});

module.exports = router;
