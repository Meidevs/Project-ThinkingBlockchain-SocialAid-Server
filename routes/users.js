var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var crypto = require('crypto');
var btoa = require('btoa');

var functions = require('../public/javascripts/functions/functions.js')
var userModel = require('../public/javascripts/components/authModel.js');
var groupModel = require('../public/javascripts/components/groupModel.js');

router.post('/login', async (req, res, next) => {
  try {
    var id = req.body.email;
    var pw = req.body.password;
    var base64String = await functions.PasswordEncryption(id, pw);

    // Get E-mail, password From Front-End
    var dataSet = new Object();
    dataSet = {
      email: id,
      password: base64String,
    };
    resResult = await userModel.Login(dataSet);

    // Insert Session Storage, E-mail, Name, Userid, Phone, wallet
    req.session.user = {
      userid: resResult.dataSet.user_seq,
      email: resResult.dataSet.email,
      name: resResult.dataSet.name,
      phone: resResult.dataSet.phone_number,
      wallet: resResult.dataSet.coin_wallet_address,
      pin: resResult.dataSet.pin_no,
      currentCash : resResult.dataSet.current_cash
    }
	console.log(req.session.user)
    res.status(200).send(resResult)
  } catch (err) {
    res.status(500).send(resResult)
  }
});

router.get('/myinfo', async (req, res) => {
  try {
    var dataSet = new Object();
    var userid = req.session.user.userid;
    var wallet = req.session.user.wallet;
    var pin = req.session.user.pin;
    var name = req.session.user.name;
    var joinArray = new Array();
    // Get ableBalance From Santa API,
    var resAPI = await fetch('http://api.santavision.net:8500/check/balance', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json',
       },
       body: JSON.stringify({ type: 'stc', address: wallet, pin: pin })
    })
    let json = await resAPI.json();

    console.log(json)
    if (resAPI.ok) {
	var list = await groupModel.GetAllJoinedList(userid)
        for (var i = 0; i < list.length; i++) {
          joinArray.push(list[i].groupsid)
        }

        if (joinArray[0] == undefined) {
	  var ableSTC = json.data.currentCash;
	  var totalSTC = req.session.user.currentCash;
          dataSet = {
            wallet: wallet,
            ableSTC: ableSTC,
            totalSTC: totalSTC,
            name: name
          }
	} else {
          var resReturn = await groupModel.GetGroupdatas(joinArray);
          var stcArray = new Array();
          for (var i = 0; i < resReturn.length; i++) {
            stcArray.push(parseInt(resReturn[i].stc) * parseInt(resReturn[i].period))
          }
          var revSum = stcArray.reduce(function (preValue, currentValue) {
            return (preValue + currentValue)
          });

          var ableSTC = json.data.currentCash;
          var totalSTC = req.session.user.currentCash;
          dataSet = {
            wallet: wallet,
            ableSTC: ableSTC,
            totalSTC: totalSTC,
            name: name
          }
        }
    }
    res.status(200).send(dataSet)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
})

module.exports = router;
