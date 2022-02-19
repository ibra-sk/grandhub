const Joi = require('joi');
const shortid = require('shortid');
const dbService = require('../dbconnect');
const { response } = require('express');
const db = dbService.getDbServiceInstance();

exports.setme = (req, res, next) => {
    if(req.body.name == null){
        res.send(`empty parameters set`);
    }else{
        console.log(req.body.name);
        console.log(req.body.cart[0].prd_id);
        console.log(req.body.cart[1].item);
        console.log(req.body.cart[2].price);
        console.log(req.body.cart[3].quantity);
        res.send('fine');
    }
}

exports.get_all_orders = (req, res, next) => {
    const result = db.queueData('SELECT * FROM orders', []);
    result
    .then(data => res.json(data))
    .catch(err => console.log(err));
}


exports.get_id_order = (req, res, next) => {
    const result = db.queueData('SELECT * FROM orders WHERE order_id=?', [req.params.id]);
    result
    .then(data => res.json(data))
    .catch(err => console.log(err));
}

exports.get_order_detail = (req, res, next) => {
    var respJson;
    const result = db.queueData('SELECT * FROM orders WHERE order_id=?', [req.params.id]);
    result
    .then(data => {
        var orderData = data;
        const resulti = db.queueData('SELECT * FROM cart_item WHERE order_id=?', [req.params.id]);
        resulti
        .then(data => {
            var cartData = data;
            respJson = {
                'ord_id': orderData[0].order_id,
                'member': orderData[0].by_member_name,
                'phone': orderData[0].by_phone,
                'time': (orderData[0].timestamp.toString().substring(0, 16)) + ' | ' + (new Date(orderData[0].timestamp).toLocaleString().toString().substring(24, 10)),
                'status': orderData[0].status,
                'address':orderData[0].address,
                'map_point':orderData[0].map_point,
                'delivery_time':orderData[0].deliver_time,
                'comment':orderData[0].comment,
                'items': cartData
            };
            res.status(200).json(respJson);
        })
        .catch(err => {
            console.log(err);
            res.status(200).json('Second Phase Error');
        });
    })
    .catch(err => {
        console.log(err);
        res.status(200).json('First Phase Error');
    });
}

exports.get_order_history = (mid, cb) => {
    const result = db.queueData('SELECT * FROM orders WHERE by_member_id=? ORDER BY timestamp DESC', [mid]);
    result
    .then(data => {
        const arrData = data;
        const totalJson = [];
        arrData.forEach(function(orderData){
            const respJson = {
                ord_id: orderData.order_id,
                member: orderData.by_member_name,
                phone: orderData.by_phone,
                time: orderData.timestamp,//(orderData.timestamp.toString().substring(0, 16)) + ' | ' + (new Date(orderData.timestamp).toLocaleString().toString().substring(24, 10)),
                status: orderData.status,
                address: orderData.address.split(',').join(' - '),
                items_number: orderData.items_number,
                map_point: orderData.map_point,
                delivery_time: orderData.deliver_time,
                comment: orderData.comment.split(',').join('. ')
            };
            totalJson.push(respJson);
        });
        cb(totalJson);
    })
    .catch(err => {
        console.log(err);
        cb('Error');
    });
}

exports.get_status_orders = (status, cb) => {
    const result = db.queueData('SELECT * FROM orders WHERE status=?', [status]);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.lastest_member_items = (mid,cb) => {
    const ItemsData = [];
    last_member_orders(function(data){
        const OrderIdList = data;
        console.log(OrderIdList);
        OrderIdList.forEach(Order => {
            const result = db.queueData('SELECT * FROM `cart_item` WHERE `order_id` = ?', [Order.order_id]);
            result
            .then(data => {
                console.log("carts: " + data);
                ItemsData.push(data);
            })
            .catch(err => cb(err));
        });        
    });
    console.log(ItemsData);
    cb(ItemsData);
}

exports.update_status = (req, res, next) => {
    const result = db.queueData('UPDATE `orders` SET `status`=1 WHERE `order_id`=?', [req.body.orderID]);
    result
    .then(data => res.status(200).json({
        success : true,
        message : 'Order Status changed'
    }))
    .catch(err => {
        console.log(err)
        res.status(200).json({
            success : false,
            message : err
        })});
}

exports.create_order = (req, res, next) => {
    if(req.body.name == null || req.body.mid == null || req.body.phone == null || req.body.address == null || req.body.cart === undefined || req.body.cart.length == 0 ){
        //console.log(req.body);
        res.status(200).json({
            success : false,
            message : 'Empty parameters set'
        });
    }else{
        var ord_id = shortid.generate();
        var mid = req.body.mid;
        var name = req.body.name;
        var phone = req.body.phone;
        var address = req.body.address;
        var deliver_time = req.body.delivery_date;
        var map_point = req.body.map_point;
        var comment = req.body.comment;
        var status = 0;
        var date = new Date();
        let items_num = req.body.cart.length;
        var timestamp = date.toJSON().slice(0, 19).replace(/[-T]/g,':');
        var total_price = 0;
        req.body.cart.forEach(item => {
            total_price = total_price + (item.price * item.quantity);
        });
        const msg = "GRANDHUB: Delivery Order from " + phone + ", for the day of " + deliver_time + ". Number of Items: " + items_num + ", Total price:  " + total_price + "ugx, Check your dashboard for more info."; //150
        send_sms(msg);
        const params = [ord_id, mid, name, phone, address, map_point, items_num, total_price, comment, deliver_time, status, timestamp];
        const result = db.queueData('INSERT INTO `orders`( `order_id`, `by_member_id`, `by_member_name`, `by_phone`, `address`, `map_point`, `items_number`, `total_price`, `comment`, `deliver_time`, `status`, `timestamp`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', params);
        result
        .then(data => sumbit_cart_item(req.body.cart, ord_id, res))
        .catch(err => console.log(err));
    }    
}

exports.new_orders_stat = (date, cb) => {
    const result = db.queueData('SELECT DATE_FORMAT(timestamp, "%D %b") AS date, COUNT(order_id) AS COUNT FROM orders WHERE timestamp BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND ? GROUP BY DATE(timestamp)', [date, date]);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.week_growth_stat = (date, cb) => {
    const result = db.queueData('SELECT DATE_FORMAT(timestamp, "%D %b") AS date, COUNT(order_id) AS COUNT, SUM(total_price) AS TOTAL FROM orders WHERE timestamp BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND ? GROUP BY DATE(timestamp)', [date, date]);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.revenue_stat = (sort, cb) => {
    const DaySQL = 'SELECT YEAR(timestamp) AS Year, MONTH(timestamp) AS Month, DAY(timestamp) AS Day, SUM(total_price) AS TOTAL FROM orders GROUP BY YEAR(timestamp), MONTH(timestamp), DAY(timestamp) Order by Year,Month, DAY asc';
    const MonthSQL = 'SELECT YEAR(timestamp) AS Year, MONTH(timestamp) AS Month, SUM(total_price) AS TOTAL FROM orders GROUP BY YEAR(timestamp), MONTH(timestamp) Order by Year,Month asc';
    const YearSQL = 'SELECT YEAR(timestamp) AS Year, SUM(total_price) AS TOTAL FROM orders GROUP BY YEAR(timestamp) Order by Year asc';
    if(sort == 'daily'){ var SQL = DaySQL }
    if(sort == 'monthly'){ var SQL = MonthSQL }
    if(sort == 'yearly'){ var SQL = YearSQL }
    const result = db.queueData(SQL, []);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

function sumbit_cart_item(cart, order_id, res) {
    var sql = 'INSERT INTO `cart_item`(`order_id`, `prd_id`, `prd_name`, `quantity`, `price`) VALUES ';
    cart.forEach(item => {
        var prd = '("'+order_id+'","'+item.prd_id+'","'+item.item+'","'+item.quantity+'","'+item.price+'"), ';
        sql = sql + prd;
    });
    sql = sql.replace(/,\s*$/, "");
    //console.log(sql);
    const result = db.queueData(sql, []);
    result
    .then(data => {return res.status(200).json({
        success: true,
        message: "Order successfully submitted",
        order_id: order_id
    }) })
    .catch(err => console.log(err));
}

function last_member_orders(member_id, callback) {
    const result = db.queueData('SELECT `order_id` FROM orders WHERE `by_members_id`=? ORDER BY timestamp DESC LIMIT 10', [member_id]);
    result
    .then(data => callback(data))
    .catch(err => callback(err));
}

function get_order_cart(orderData, callback) {
    const resulti = db.queueData('SELECT * FROM cart_item WHERE order_id=?', [orderData.order_id]);
    resulti
    .then(data => {
        const cartData = data;
        const respJson = {
            ord_id: orderData.order_id,
            member: orderData.by_member_name,
            phone: orderData.by_phone,
            time: (orderData.timestamp.toString().substring(0, 16)) + ' | ' + (new Date(orderData.timestamp).toLocaleString().toString().substring(24, 10)),
            status: orderData.status,
            address: orderData.address,
            items_number: orderData.items_number,
            map_point: orderData.map_point,
            delivery_time: orderData.deliver_time,
            comment: orderData.comment,
            items: cartData
        };
        callback(respJson);
    })
    .catch(err => {
        console.log(err);
        callback([]);
    });
}

function send_sms(msg){
    const credentials = {
        apiKey: 'b0682cd8675c5928638c74b7c8b5f3fd543201b646f8dd1f155370acd29d4d00',         // use your sandbox app API key for development in the test environment
        username: 'grandhub',      // use 'sandbox' for development in the test environment
    };
    const AfricasTalking = require('africastalking')(credentials);
     
    // Initialize a service e.g. SMS
    const sms = AfricasTalking.SMS
     
    // Use the service
    const options = {
        to: ['+25675665167'],
        message: msg
    }
     
    // Send message and capture the response or error
    sms.send(options)
        .then( response => {
            console.log(response);
            console.log(response.Recipients)
        })
        .catch( error => {
            console.log("err");
            console.log(error);
        });
}