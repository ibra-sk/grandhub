const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4000/";

module.exports = (req, res, next) => {
    const cookies = req.headers.cookie;
    if(cookies.includes('tokencookie')){
        var tokenKey = cookies.substr(cookies.indexOf('tokencookie=') + 12, cookies.length); 
        try {
            const decode = jwt.verify(tokenKey,"grandhub_auth@secretkey")
            req.userData = decode;
            next();
        } catch (error){
            res.redirect(BASE_URL+ 'dashboard/login?status=auth');
        }
    }else{
        res.redirect(BASE_URL+ 'dashboard/login?status=auth');
    }
}