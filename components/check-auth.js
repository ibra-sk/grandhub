const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const cookies = req.headers.cookie;
    if(cookies.includes('tokencookie')){
        var tokenKey = cookies.substr(cookies.indexOf('tokencookie=') + 12, cookies.length); 
        try {
            const decode = jwt.verify(tokenKey,"grandhub_auth@secretkey")
            req.userData = decode;
            next();
        } catch (error){
            res.redirect('http://127.0.0.1:4000/dashboard/login?status=auth');
        }
    }else{
        res.redirect('http://127.0.0.1:4000/dashboard/login?status=auth');
    }
}