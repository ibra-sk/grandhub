const express = require('express');
const multer = require('multer');
const router = express.Router();
const Products = require('../components/products');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/source/');
    },
    filename: function(req, file, cb){
        console.log("file: " + req.file);
        cb(null,  makeid(5) + '.jpg');
    }
})
const upload = multer({storage: storage});

//Route Setup
router.get('/search/:key', (req, res) => {
    const Key = req.params.key;
    Products.search_product(Key, function(data){
        console.log('works search');
        res.status(200).json(data);
    });
});

router.get('/category/', (req, res) => {
    Products.get_category(function(data){
        console.log('works cate');
        res.status(200).json(data);
    });
});

router.get('/category/:name', (req, res) => {
    const Name = req.params.name;
    Products.get_category_product(Name, function(data){
        console.log('works cate name');
        res.status(200).json(data);
    });
});

router.get('/list/:name', (req, res) => {
    const Name = req.params.name;
    Products.get_available_products(Name, function(data){
        console.log('works list name');
        res.status(200).json(data);
    });
});

router.get('/', (req, res) => {
    Products.get_all_products(function(data){
        console.log('works');
        res.status(200).json(data);
    });
});

router.get('/:id', (req, res) => {
    const ID = req.params.id;
    Products.get_id_product(ID, function(data){
        console.log('works');
        res.status(200).json(data);
    });
});

router.post('/category', Products.add_category);

router.post('/category/delete', Products.remove_category);

router.post('/', upload.single('productImage'), Products.create_product);

//router.put('/:id', Products.update_product);
router.put('/:id', (req, res, next) => {
    if(req.file !== undefined){
        console.log('went this');
        upload.single('productImage')(req, res, function (err) {
            if (err) {
                // An error occurred when uploading
                console.log(err);
            }else{
                Products.update_product(req, res, next);
            }
        })
    }else{
        console.log('went here');
        Products.update_product(req, res, next);
    }
});

router.put('/stocks/:id', Products.change_product_stock);

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

module.exports = router;