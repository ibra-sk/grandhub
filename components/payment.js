const express = require('express');
const router = express.Router();

const PublicKey = "FLWPUBK-7f5b68b43dd233c5e05fcfd0d56368bb-X";
const SecretKey = "FLWSECK-78bc22f4598a2d19f1a6c490eb1b55b4-X";
const EncKey    = "78bc22f4598a2a39c28a4edc";
const payload = {
    "card_number": "5531886652142950",
    "cvv": "564",
    "expiry_month": "09",
    "expiry_year": "21",
    "currency": "UGX",
    "amount": "1000",
    "redirect_url": "https://www.google.com",
    "fullname": "Olufemi Obafunmiso",
    "email": "olufemi@flw.com",
    "phone_number": "0902620185",
    "enckey": EncKey,
    "tx_ref": "MC-32444ee--4eerye4euee3rerds4423e43e" // This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.

}

router.get('/card/:amount/:email/:phone', (req, res, next) => {
    res.render('card_payment', {amount: req.params.amount, email: req.params.email, phone: req.params.phone, public: PublicKey});
})

router.get('/success/:resp', (req, res, next) => {
    res.status(200).json({
        status: true,
        message: 'Payment successfully completed'
    });
})

router.get('/failed/:resp', (req, res, next) => {
    res.status(200).json({
        status: false,
        message: 'Payment process failed'
    });
})

router.get('/sms/balance', (req, res, next) => {
    // Set your app credentials
    const credentials = {
        apiKey: 'b0682cd8675c5928638c74b7c8b5f3fd543201b646f8dd1f155370acd29d4d00',
        username: 'grandhub'
    }

    // Initialize the SDK
    const AfricasTalking = require('africastalking')(credentials);
    // Get the application service
    const app = AfricasTalking.APPLICATION;

    function getApplicationData() {
        // Fetch the application data
        app.fetchApplicationData()
            .then((data) => {
                res.send(`The account balance is ${data.UserData.balance}`);
            }).catch(console.log);
    }

    getApplicationData();
})

router.get('/sms', (req, res, next) => {
    const credentials = {
        apiKey: 'b0682cd8675c5928638c74b7c8b5f3fd543201b646f8dd1f155370acd29d4d00',         // use your sandbox app API key for development in the test environment
        username: 'grandhub',      // use 'sandbox' for development in the test environment
    };
    const AfricasTalking = require('africastalking')(credentials);
     
    // Initialize a service e.g. SMS
    ///const sms = AfricasTalking.SMS
     
    // Use the service
    const options = {
        to: ['+256756651367'],
        message: "GRANDHUB Delivery Order from 0778301082, for the day of 30 Jun 2020. Number of Items: 10, Total price: 100000ugx, Check your dashboard for more info." //147
    }
     
    // Send message and capture the response or error
    sms.send(options)
        .then( response => {
            console.log(response);
        })
        .catch( error => {
            console.log(error);
        });
})

module.exports = router;