var express = require('express');
var router = express.Router();
var otcModel = require('../public/javascripts/components/otcModel.js');

router.get('/main', function(req, res, next) {
  res.render('main');
});
router.get('/getlist', async (req, res) => {
  try {
    var Sell_Array = new Array();
    var Buy_Array = new Array();
    var resData = new Object();
    var List_Of_Tx = await otcModel.GetOTCList();
    for (var i = 0; i < List_Of_Tx.length; i++) {
      if (List_Of_Tx[i].status == 0) {
        Sell_Array.push(List_Of_Tx[i]);
      }
      if (List_Of_Tx[i].status == 1) {
        Buy_Array.push(List_Of_Tx[i]);
      }
    }
    resData = {
      sell : Sell_Array,
      buy : Buy_Array
    }
    res.status(200).send(resData)
  } catch (err) {
    console.log(err)
  }
})

router.get('/enrollsell', function(req, res, next) {
  res.render('sell');
});
router.get('/enrollbuy', function(req, res, next) {
  res.render('buy');
});
router.post('/insertsell', async (req, res) => {
  try {
    console.log(req.body)
    var dataSet = new Object();
    dataSet = {
      date : req.body.date,
      name : req.body.name,
      phonenumber : req.body.phonenumber,
      address : req.body.address,
      amount : req.body.amount,
      status : req.body.status,
    }
    await otcModel.InsertInto(dataSet);
    res.status(200).send(true)
  } catch (err) {
    console.log(err)
  }
})
router.post('/insertbuy', async (req, res) => {
  try {
    var dataSet = new Object();
    dataSet = {
      date : req.body.date,
      name : req.body.name,
      phonenumber : req.body.phonenumber,
      address : req.body.address,
      amount : req.body.amount,
      status : req.body.status,
    }
    await otcModel.InsertInto(dataSet);
    res.status(200).send(true)
  } catch (err) {

  }
})

module.exports = router;
