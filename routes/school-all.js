const express = require("express");
const mysql = require("mysql");

const router = express.Router();

router.post("/", (req, res) => {
  var data = [];
  var status = 400;
  const body = req.body;
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
      var sql = `SELECT * from schools`;
      con.query(sql, function (err, result) {
        if (err) {
          status = 500;
          data = err;
        } else if (result && result.length != 0) {
          // console.log(1);
          // console.log(result);
          status = 200;
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
