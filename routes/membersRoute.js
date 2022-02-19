const express = require("express");
const router = express.Router();
const moment = require("moment");
const Member = require("../components/members");

//Route Setup
router.get("/", (req, res) => {
  Member.get_all_members(function (data) {
    console.log("works");
    res.status(200).json(data);
  });
});

router.get("/:id", (req, res) => {
  const ID = req.params.id;
  Member.get_id_member(ID, function (data) {
    console.log("works");
    res.status(200).json(data);
  });
});

router.get("/stat/:date", (req, res) => {
  const date = req.params.date;
  Member.new_customer_stat(date, function (data) {
    console.log("works stat");
    const result = Object.values(JSON.parse(JSON.stringify(data)));
    console.log(date);
    console.log(result);
    var answer = [];
    const daysAgo = [];
    for (var i = 0; i <= 6; i++) {
      daysAgo.push(moment(date).subtract(i, "days").format("Do MMM"));
    }
    daysAgo.reverse();
    daysAgo.forEach((day) => {
      let value = result.find((result) => result["date"] == day);
      if (value !== undefined) {
        answer.push({ date: day, COUNT: value.COUNT });
      } else {
        answer.push({ date: day, COUNT: 0 });
      }
    });
    console.log(answer);
    res.status(200).json(answer);
  });
});

//router.post('/', (req, res) => {
//    Member.create_member(function(data){
//        console.log('works post');
//        res.status(200).json(data);
//    });
//});

router.post("/", Member.create_member);

router.put("/:id", Member.update_member);

router.post("/login", Member.signin);

module.exports = router;
