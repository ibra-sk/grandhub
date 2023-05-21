const express = require("express");
const router = express.Router();
const moment = require("moment");
const Orders = require("../components/orders");
const dotenv = require('dotenv');
dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4000/";

//Route Setup
router.get("/", Orders.get_all_orders);

router.get("/:id", Orders.get_id_order);

router.get("/detail/:id", Orders.get_order_detail);

router.get("/history/:mid", (req, res) => {
  const mid = req.params.mid;
  Orders.get_order_history(mid, function (data) {
    console.log("works history");
    if (data == "Error") {
      res.status(200).json({
        success: false,
        message: "error",
      });
    } else {
      res.status(200).json({
        success: true,
        data: data,
      });
    }
  });
});

router.get("/stat/:date", (req, res) => {
  const date = req.params.date;
  console.log("sert date: " + date);
  Orders.new_orders_stat(date, function (data) {
    //console.log(data);
    const result = Object.values(JSON.parse(JSON.stringify(data)));
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
    res.status(200).json(answer);
  });
});

router.get("/growth/:date", (req, res) => {
  const date = req.params.date;
  Orders.week_growth_stat(date, function (data) {
    //console.log(data);
    const result = Object.values(JSON.parse(JSON.stringify(data)));
    var answer = [];
    const daysAgo = [];
    for (var i = 0; i <= 6; i++) {
      daysAgo.push(
        moment(date).subtract(i, "days").startOf(date).format("Do MMM")
      );
    }
    daysAgo.reverse();
    daysAgo.forEach((day) => {
      let value = result.find((result) => result["date"] == day);
      if (value !== undefined) {
        answer.push({ date: day, COUNT: value.COUNT, TOTAL: value.TOTAL });
      } else {
        answer.push({ date: day, COUNT: 0, TOTAL: 0 });
      }
    });
    //console.log(answer);
    res.status(200).json(answer);
  });
});

router.get("/sales/:sort", (req, res) => {
  const Sort = req.params.sort;
  Orders.revenue_stat(Sort, function (data) {
    const result = Object.values(JSON.parse(JSON.stringify(data)));
    var answer = [];
    if (Sort == "daily") {
      const days = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30",
        "31",
      ];
      days.forEach((day) => {
        let value = result.find((result) => result["Day"] == day);
        if (value !== undefined) {
          answer.push({ Day: day, Total: value.TOTAL });
        } else {
          answer.push({ Day: day, Total: 0 });
        }
      });
    } else if (Sort == "monthly") {
      const months = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
      ];
      months.forEach((month) => {
        let value = result.find((result) => result["Month"] == month);
        if (value !== undefined) {
          answer.push({ Month: month, Total: value.TOTAL });
        } else {
          answer.push({ Month: month, Total: 0 });
        }
      });
    } else if (Sort == "yearly") {
      const years = [
        "2020",
        "2021",
        "2022",
        "2023",
        "2024",
        "2025",
        "2026",
        "2027",
        "2028",
        "2029",
        "2030",
      ];
      years.forEach((year) => {
        let value = result.find((result) => result["Year"] == year);
        if (value !== undefined) {
          answer.push({ Year: year, Total: value.TOTAL });
        } else {
          answer.push({ Year: year, Total: 0 });
        }
      });
    }
    res.status(200).json(answer);
  });
});

router.post("/", Orders.create_order);

router.post("/set", Orders.setme);

router.post("/status", Orders.update_status);

module.exports = router;
