var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var functions = require('../public/javascripts/functions/functions.js');

router.post('/hostname', async (req, res) => {
    try {
        console.log(req.body.username)
        var username = req.body.username;
        var rawArray = new Array();
        var resArray = new Array();
        var resReturn = await authModel.SelectAll();
        for (let value of resReturn[0]) {
            rawArray.push([value.userid, value.name])
        }
        console.log(rawArray)
        for (var i = 0; i < rawArray.length; i++) {
            var rawObj = new Object();

            if (rawArray[i][1].indexOf(username) > -1) {
                rawObj.userid = rawArray[i][0];
                rawObj.name = rawArray[i][1];
                resArray.push(rawObj);
            } else {
                continue;
            }
        }
        res.status(200).send(resArray);
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
})

router.post('/setalarm', async (req, res) => {
    try {
        
        await alarmModel.SetAlarm();
        res.status(200).send(resReturn)
    } catch (err) {
        console.log(err);
        res.status(500).send(false)
    }
});

module.exports = router;
