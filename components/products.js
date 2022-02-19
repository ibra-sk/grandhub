const Joi = require('joi');
const shortid = require('shortid');
const dbService = require('../dbconnect');
const { response } = require('express');
const db = dbService.getDbServiceInstance();

function check_prd_id(pid) {
    const result = db.queueData('SELECT * FROM products WHERE prd_id=?', [pid]);
    result
    //.then(data => { if(data[0] == null){ return 0}else{return 1} })
    .then(data => { return data })
    .catch(err => console.log(err));
}

exports.get_category = (cb) => {
    const result = db.queueData('SELECT * FROM category', []);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.total_category = (cb) => {
    const result = db.queueData('SELECT COUNT(title) AS Totalnumber FROM category', []);
    result
    .then(data => cb(data[0].Totalnumber))
    .catch(err => cb(err));
}

exports.get_available_products = (name, cb) => {
    const result = db.queueData('SELECT * FROM products WHERE category=? AND available=1', [name]);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.get_all_products = (cb) => {
    const result = db.queueData('SELECT * FROM products', []);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.get_id_product = (id, cb) => {
    const result = db.queueData('SELECT * FROM products WHERE prd_id=?', [id]);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.search_product = (key, cb) => {
    const result = db.queueData('SELECT * FROM products WHERE `Name` LIKE "%'+key+'%"', []);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.get_category_product = (name, cb) => {
    const result = db.queueData('SELECT * FROM products WHERE category=?', [name]);
    result
    .then(data => cb(data))
    .catch(err => cb(err));
}

exports.total_products = (cb) => {
    const result = db.queueData('SELECT COUNT(prd_id) AS Totalnumber FROM products', []);
    result
    .then(data => cb(data[0].Totalnumber))
    .catch(err => cb(err));
}

exports.add_category = (req, res, next) => {
    if(req.body.name == null){
        res.status(200).json({
            success : false,
            message : 'Empty parameter sent.'
        })
    }else{
        const result = db.queueData('INSERT INTO `category`(`title`) VALUES (?)', req.body.name);
        result
        .then(data => res.status(200).json({
            success : true,
            message : 'Category has been added.'
        }))
        .catch(err => res.status(200).json({
            success : false,
            message : err
        }));
    }    
}

exports.remove_category = (req, res, next) => {
    if(req.body.name == null){
        res.status(200).json({
            success : false,
            message : 'Empty parameter sent.'
        })
    }else{
        const result = db.queueData('DELETE FROM `category` WHERE `title`=?', req.body.name);
        result
        .then(data => res.status(200).json({
            success : true,
            message : 'Category ha been removed.'
        }))
        .catch(err => res.status(200).json({
            success : false,
            message : err
        }));
    }    
}

exports.create_product = (req, res, next) => {
    console.log(req.file.filename);
    if(req.body.name == null || req.body.info == null || req.body.price == null || req.body.category == null){
        res.send(`empty parameters set`);
        console.log(req.body);
    }else{
        var pid = shortid.generate();
        var name = req.body.name;
        var info = req.body.info;
        var price = req.body.price;
        var category = req.body.category;
        var thumbnail = "http://192.168.137.1:4000/images/source/" + req.file.filename + ".jpg";
        var stock = 1;
        var date = new Date();
        const params = [pid, name, info, category, price, thumbnail, stock, date];
        const result = db.queueData('INSERT INTO products( `prd_id`, `Name`, `Info`, `Category`, `Price`, `thumbnail`, `available`, `date_created`) VALUES (?,?,?,?,?,?,?,?)', params);
        result
        .then(data => res.status(200).send('Producti has been Created'))
        .catch(err => console.log(err));
    }    
}


exports.update_product = (req, res, next) => {
    const params = []
    var sql = 'UPDATE products SET ';
    if(req.body.name !== undefined){
        sql = sql + 'name=?,';
        params.push(req.body.name);
    }
    if(req.body.info !== undefined){
        sql = sql + 'info=?,';
        params.push(req.body.info);
    }
    if(req.body.price !== undefined){
        sql = sql + 'price=?,';
        params.push(req.body.price);
    }
    if(req.body.category !== undefined){
        sql = sql + 'category=?,';
        params.push(req.body.category);
    }
    
    sql = sql.replace(/,\s*$/, "")
    sql = sql + ' WHERE prd_id=?';
    var pid = req.params.id;
    params.push(pid);
    const result = db.queueData(sql, params);
    result
    .then(data => res.status(200).send('Product with id:'+pid+' has been Updated'))
    .catch(err => {
        console.log(err)
        res.status(400).send('Product Update Failed')
    });
}

exports.change_product_stock = (prdId, stock, cb) => {
    if(stock !== undefined){
        var stock = stock;
        var pid = prdId;
        const params = [stock, pid];
        var sql = 'UPDATE products SET available=? WHERE prd_id=?';
        const result = db.queueData(sql, params);
        result
        .then(data => cb('Updated'))
        .catch(err => {
            console.log(err);
            cb(err);
        });
    }else{
        cb('Invalid parameter');
    }
}

exports.remove_product = (prdId, cb) => {
    var pid = prdId;
    const params = [pid];
    var sql = 'DELETE FROM products WHERE prd_id=?';
    const result = db.queueData(sql, params);
    result
    .then(data => cb('Deleted'))
    .catch(err => {
        console.log(err);
        cb(err);
    });
}