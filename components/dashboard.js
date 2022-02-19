const { response } = require('express');
const Members = require('../components/members');
const Products = require('../components/products');
const Orders = require('../components/orders');

exports.mainpage = (req, res, next) => {
    res.render('mainpage');
}

exports.loginpage = (req, res, next) => {
    res.render('login');
}

exports.logoutpage = (req, res, next) => {
    res.cookie("tokencookie", "", { expires: new Date() });
    res.redirect('http://127.0.0.1:4000/dashboard');
}

exports.latest = (req, res, next) => {
    Orders.lastest_member_items("C8Bh13LKH",function(data){
        res.status(200).json(data);
    });
}

exports.products_view = (req, res, next) => {
    Products.get_all_products(function(data){
        const data_array = data;
        Products.total_products(function(data){
            const Totalnumber = data;
            Products.total_category(function(data){
                const Totalcate = data;
                res.render('products', { data: data_array, totalprd: Totalnumber, totalcate: Totalcate}); 
            });
        });
    });    
}

exports.products_add = (req, res, next) => {
    Products.get_category(function(data){
        const data_array = data;
        res.render('add_product', { data: data_array}); 
    });    
}

exports.products_edit = (req, res, next) => {
    const prdId = req.params.prdId;
    Products.get_category(function(data){
        const data_array = data;
        Products.get_id_product(prdId, function(data){
            if( Object.prototype.toString.call( data ) === '[object Array]' ) {
                const prd_Data = data[0];
                res.render('edit_product', { data: data_array, prdData: prd_Data}); 
            }else{
                console.log(data);
            }            
        }); 
    });    
}

exports.products_status = (req, res, next) => {
    const prdId = req.params.prdId;
    const stockNow = req.params.stock;
    if(stockNow == 1){
        var stock = 0;
    }else{
        var stock = 1;
    }
    Products.change_product_stock(prdId, stock, function(data){
        const data_array = data;
        if(data == 'Updated'){
            res.redirect('/dashboard/products');
        }else{
            res.redirect('/dashboard/products');
        }
    });    
}

exports.products_delete = (req, res, next) => {
    const prdId = req.params.prdId;
    Products.remove_product(prdId, function(data){
        const data_array = data;
        if(data == 'Deleted'){
            res.redirect('/dashboard/products');
        }else{
            res.redirect('/dashboard/products');
        }
    });    
}

exports.category_view = (req, res, next) => {
    Products.get_category(function(data){
        const data_array = data;
        res.render('add_category', { data: data_array});       
    });    
}

exports.members_view = (req, res, next) => {
    Members.total_members(function(data){
        const totalmembers = data;
        Members.total_guests(function(data){
            const totalguests = data;
            Members.get_all_members(function(data){
                const data_array = data;
                res.render('members', { data: data_array, totalmembers: totalmembers, totalguests: totalguests}); 
            });        
        });         
    });    
}

exports.member_info = (req, res, next) => {
    Members.get_id_member(req.params.id, function(data){
        const memberInfo = data[0];
        res.render('member_info', { data: memberInfo});     
    });    
}

exports.orders_view = (req, res, next) => {
    Orders.get_status_orders(1, function(data){
        const TotalFinishedOrders = data.length;
        Orders.get_status_orders(0,function(data){
            const TotalPendingOrders = data.length;
            const dataArray = data;
            res.render('orders', { complete_ord: TotalFinishedOrders, pending_ord: TotalPendingOrders, data: dataArray}); 
        });
    });    
}