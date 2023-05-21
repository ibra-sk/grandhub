const express = require('express');
const bodyParser = require('body-parser');
const Payments = require('./components/payment.js')
const productRouter = require('./routes/productsRoute.js');
const memberRouter = require('./routes/membersRoute.js');
const orderRouter = require('./routes/ordersRoute.js');
const authRouter = require('./routes/authRoute.js');
const dashboardRouter = require('./routes/dashboardRoute.js');
const dotenv = require('dotenv');
dotenv.config();

//App Setup
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//app.use(express.json());

//CORS Handling
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/api/products', productRouter);
app.use('/api/members', memberRouter);
app.use('/api/order', orderRouter);
app.use('/api/auth', authRouter);
app.use('/api/payment', Payments);
app.use('/dashboard/', dashboardRouter);

const port = process.env.PORT || 4000;
var server = app.listen(port, function(){
    console.log(`listining request to port ${port}`);
});

//Static Setup
app.use(express.static('public'));

//Error Handling
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    });
});
