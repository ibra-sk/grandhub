const express = require('express');
const router = express.Router();
const Staff = require('../components/staff');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4000/";

//Route Setup
router.post('/signin', (req, res, next) => {
    Staff.signin(req.body.email, req.body.password, function(data){
        if(data.success == true){
            const token = jwt.sign({
                email: req.body.email,
                userId: data.usr_id,
                name: data.name
            }, "grandhub_auth@secretkey",{
                expiresIn: "6h"
            })
            res.cookie("tokencookie", token, { secure:false, maxAge:31536000, httpOnly: false }); //change secure to true after production
            res.redirect(BASE_URL+ 'dashboard');
            //res.send(token);
        }else{
            res.redirect(BASE_URL+ 'dashboard/login?status=fail');
            //res.send('fail')
        }
    });
});

module.exports = router;