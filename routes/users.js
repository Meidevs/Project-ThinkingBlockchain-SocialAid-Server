var express = require('express');
var router = express.Router();
var functions = require('../public/javascripts/functions/functions.js')
var userModel = require('../public/javascripts/components/authModel.js');
var groupModel = require('../public/javascripts/components/groupModel.js');

router.post('/login', async (req, res, next) => {
  try {
    // Get E-mail, password From Front-End
    var dataSet = new Object();
    dataSet = {
      email: req.body.email,
      password: req.body.password
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
    }
	console.log(req.session.user)
    res.status(200).send(resResult)
  } catch (err) {
    res.status(500).send(resResult)
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

router.get('/myinfo', async (req, res) => {
  try {
    var dataSet = new Object();
    var userid = req.session.user.userid;
    var wallet = req.session.user.wallet;
    var pin = req.session.user.pin;
    var name = req.session.user.name;
    var joinArray = new Array();

    // Get ableBalance From Santa API,
    let resBalance = await fetch('http://api.santavision.net/check/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        body: JSON.stringify({ type: 'stc', address: wallet, pin: pin })
      }
    })
    let json = await resBalance.json();
    if (resBalance.ok) {
      console.log(json)
    }
    var list = await groupModel.GetAllJoinedList(userid)
    console.log(list)
    for (var i = 0; i < list.length; i++) {
      joinArray.push(list[i].groupsid)
    }
    
    if (joinArray[0] == undefined) {
      dataSet = {
        wallet: wallet,
        ableSTC: 0,
        totalSTC: 0,
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

      var ableSTC = json.data.balance;
      var totalSTC = revSum + ableSTC;
      dataSet = {
        wallet: wallet,
        ableSTC: ableSTC,
        totalSTC: totalSTC,
        name: name
      }
    }

    res.status(200).send(dataSet)
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router;
