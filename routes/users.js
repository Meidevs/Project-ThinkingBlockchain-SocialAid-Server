var express = require('express');
var router = express.Router();
var functions = require('../public/javascripts/functions/functions.js')
var userModel = require('../public/javascripts/components/authModel.js');

router.post('/login', async (req, res, next) => {

  try {
    // Get E-mail, password From Front-End
    var dataSet = new Object();
    dataSet = {
      email: req.body.email,
      password: req.body.password
    }
    resResult = await userModel.Login(dataSet);

    // Insert Session Storage, E-mail, Name, Userid, Phone
    req.session.user = {
      userid : resResult.dataSet.userid,
      email : resResult.dataSet.email,
      name : resResult.dataSet.name,
      phone : resResult.dataSet.phone,
    }
    res.status(200).send(resResult)
  } catch (err) {
    console.log(err)
    res.status(500).send({
      Err : '에러!!'
    })
  }
});


router.post('/register', async (req, res, next) => {
  try {
    // Transfer E-mail, Phonenumber, Name, PIN Number to Santa Wallet API to Get Wallet Addr
    // After Get Wallet Addr, INSERT User Information to Local Database
    // dataSet is the Form which is transfered to Santa Wallet API. 
    var dataSet = new Object();
    result = await functions.EleminateMarks(req.body.phonenumber)
    dataSet = {
      email: req.body.email,
      password: req.body.password,
      pin: req.body.pin,
      name: req.body.name,
      phonenumber: result,
      wallet: null,
    }

    // Put Request to Santa Wallet API

    dataSet.wallet = 'W23iA2jSuAODhjWusJShbXmSI81KSapOsXY35'
    var resResult = await userModel.Register(dataSet);
    // Paste Here, Storing User data to Session Process

    res.status(200).send(resResult)
  } catch (err) {
    console.log(err)
    res.status(500).send(false)
  }
});

module.exports = router;
