const express = require('express');
const router = express.Router();
const Dashboard = require('../components/dashboard');
const checkAuth = require('../components/check-auth');

//Route Setup
router.get('/', checkAuth,      Dashboard.mainpage);
router.get('/main', checkAuth,  Dashboard.mainpage);
router.get('/login', Dashboard.loginpage);
router.get('/logout', Dashboard.logoutpage);

router.get('/products', checkAuth, Dashboard.products_view);
router.get('/products/add_category', checkAuth, Dashboard.category_view);
router.get('/products/add', checkAuth, Dashboard.products_add);
router.get('/products/edit/:prdId', checkAuth, Dashboard.products_edit);
router.get('/products/status/:prdId/:stock', checkAuth, Dashboard.products_status);
router.get('/products/delete/:prdId', checkAuth, Dashboard.products_delete);

router.get('/members', checkAuth, Dashboard.members_view);
router.get('/members/info/:id', checkAuth, Dashboard.member_info);

router.get('/orders', checkAuth, Dashboard.orders_view);

module.exports = router;