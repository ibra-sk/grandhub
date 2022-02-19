const Joi = require('joi');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const dbService = require('../dbconnect');
const { response } = require('express');
const e = require('express');
const db = dbService.getDbServiceInstance();

exports.signin = (req, res, next) => {
    if(req.body.email == null || req.body.password == null) {
        return res.status(401).json({
            success: false,
            message: 'Login parameter missing'
        })
    } else {
        const result = db.queueData('SELECT * FROM members WHERE email=?', [req.body.email]);
        result
        .then(data => {
            if(data[0] == null) {
                return res.status(401).json({
                    success: false,
                    message: 'Login failed'
                });
            } else {
                bcrypt.compare(req.body.password, data[0].password, function(err, resp) {
                    if(err){
                        return res.status(401).json({
                            success: false,
                            message: 'Login failed'
                        })
                    }else{
                        if(resp){
                            return res.status(200).json({
                                success: true,
                                message: 'Login successful',
                                fullname: data[0].fullname,
                                phone: data[0].phone_number,
                                address: data[0].address,
                                mid: data[0].mid,
                                map_point: data[0].map_point,
                                born: data[0].birthdate
                            })
                        } else {
                            return res.status(401).json({
                                success: false,
                                message: 'Login failed'
                            })
                        }
                        
                    }
                })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(401).json({
                success: false,
                message: 'Login Error'
            })
        });
    }
    
}

exports.get_all_members = (cb) => {
    const result = db.queueData('SELECT * FROM members', []);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.get_id_member = (id, cb) => {
    const result = db.queueData('SELECT * FROM members WHERE mid=?', [id]);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.total_members = (cb) => {
    const result = db.queueData('SELECT COUNT(mid) AS Totalnumber FROM members', []);
    result
    .then(data => cb(data[0].Totalnumber))
    .catch(err => cb(err));
}

exports.total_guests = (cb) => {
    const result = db.queueData('SELECT COUNT(DISTINCT by_member_id) AS Totalguest FROM orders WHERE by_member_id LIKE "GUEST-%"', []);
    result
    .then(data => cb(data[0].Totalguest))
    .catch(err => cb(err));
}

exports.create_member = (req, res, next) => {
    if(req.body.name == null || req.body.email == null || req.body.password == null || req.body.phone == null || req.body.bornday == null || req.body.address == null || req.body.device == null || req.body.location == null){
        console.log(req.body);
        res.status(200).json({
            success : false,
            message : 'Empty parameters set'
        });
        //res.json(req.body);
    }else{
        check_double(req.body.email, req.body.phone, function(data) {
            if(data == null){
                bcrypt.hash(req.body.password, 10, (err , hash) => {
                    if(err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        var mid = shortid.generate();
                        var name = req.body.name;
                        var email = req.body.email;
                        var pwd = hash;                
                        var phone = req.body.phone;
                        var bornday = new Date(req.body.bornday);
                        var address = req.body.address;
                        var device = req.body.device;
                        var location = req.body.location;
                        var map_point = req.body.map_point;
                        var date = new Date();
                        const params = [mid, name, email, pwd, phone, bornday,location, device, address, map_point, date];
                        const result = db.queueData('INSERT INTO members(`mid`, `fullname`, `email`, `password`, `phone_number`, `birthdate`, `location`, `device`, `address`, `map_point`, `date_created`) VALUES (?,?,?,?,?,?,?,?,?,?,?)', params);
                        result
                        .then(data => res.status(200).json({
                            success : true,
                            message : 'Member has been Created',
                            mid : mid
                        }))
                        .catch(err => console.log(err));
                    } 
                });
            } else {
                return res.status(409).json({
                    success : false,
                    message : 'Email or Phone number already Exist.'
                })
            }     
        }); 
    }    
}


exports.update_member = (req, res, next) => {
    const params = []
    var sql = 'UPDATE members SET ';
    if(req.body.name !== undefined){
        sql = sql + 'fullname=?,';
        params.push(req.body.name);
    }
    if(req.body.location !== undefined){
        sql = sql + 'location=?,';
        params.push(req.body.location);
    }
    if(req.body.bornday !== undefined){
        sql = sql + 'birthdate=?,';
        params.push(req.body.bornday);
    }
    if(req.body.address !== undefined){
        sql = sql + 'address=?,';
        params.push(req.body.address);
    }
    sql = sql.replace(/,\s*$/, "")
    sql = sql + ' WHERE mid=?';
    var mid = req.params.id;
    params.push(req.params.id);
    const result = db.queueData(sql, params);
    result
    .then(data => res.send('Member has been Updated'))
    .catch(err => console.log(err));
}

exports.new_customer_stat = (date, cb) => {
    //const result = db.queueData('SELECT DATE_FORMAT(date_created, "%D %b") AS date, COUNT(mid) AS COUNT FROM members WHERE date_created BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() GROUP BY DATE(date_created)', []);
    const result = db.queueData('SELECT DATE_FORMAT(date_created, "%D %b") AS date, COUNT(mid) AS COUNT FROM members WHERE date_created BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND ? GROUP BY DATE(date_created)', [date, date]);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

function check_mid_member(mid) {
    const result = db.queueData('SELECT * FROM members WHERE mid=?', [mid]);
    result
    //.then(data => { if(data[0] == null){ return 0}else{return 1} })
    .then(data => { return data })
    .catch(err => console.log(err));
}

function check_double(mail, number, cb) {
    const result = db.queueData('SELECT * FROM members WHERE email=? OR phone_number=?', [mail,number]);
    result
    .then(data => cb(data[0]))
    .catch(err => cb(err));
}
