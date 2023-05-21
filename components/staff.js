const Joi = require('joi');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const dbService = require('../dbconnect');
const db = dbService.getDbServiceInstance();
const dotenv = require('dotenv');
dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4000/";


exports.signin = (email, password, cb) => {
    if(email == null || password == null) {
        console.log('param fail');
        cb({
            success: false,
            message: 'Login parameter missing'
        })
    } else {
        const result = db.queueData('SELECT * FROM staff WHERE email=?', [email]);
        result
        .then(data => {
            if(data[0] == null) {
                cb({
                    success: false,
                    message: 'Login failed'
                });
            } else {
                bcrypt.compare(password, data[0].password, function(err, resp) {
                    if(err){
                        cb({
                            success: false,
                            message: 'Login failed'
                        });
                    }else{
                        if(resp){
                            cb({
                                success: true,
                                message: 'Login successful',
                                usr_id: data[0].id,
                                name: data[0].name,
                                role: data[0].role
                            })
                        } else {
                            cb({
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
            cb({
                success: false,
                message: 'Login Error'
            })
        });
    }
    
}