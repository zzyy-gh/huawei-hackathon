const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", async (req, res) => {
  var data = [];
  var status = 200;
  const body = req.body;
  // --------------------------------------------------
  console.log("sa: ", body);

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
      var sql = `SELECT * from schools`;
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
          var tempData = {};
          result.map((item) => {
            if (tempData[item["school_id"]] == undefined) {
              tempData[item["school_id"]] = {};
              tempData[item["school_id"]]["school_id"] = item["school_id"];
              tempData[item["school_id"]]["name"] = item["school"];
              tempData[item["school_id"]]["courses"] = [];
            }
            if (
              tempData[item["school_id"]]["courses"].includes(item["course"]) ==
                false &&
              item["course"] != null
            ) {
              tempData[item["school_id"]]["courses"].push(item["course"]);
            }
          });
          // console.log(tempData);
          for (const [key, value] of Object.entries(tempData)) {
            // console.log(value);
            const obj = {
              school_id: value["school_id"],
              name: value["name"],
              courses: value["courses"],
            };
            data.push(obj);
          }
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
