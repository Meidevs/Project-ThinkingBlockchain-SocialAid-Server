var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var functions = require('../public/javascripts/functions/functions.js');
var alarmModel = require('../public/javascripts/components/alarmModel.js');

router.post('/hostname', async (req, res) => {
    try {
        var username = req.body.username;
        var rawArray = new Array();
        var resArray = new Array();
        var resReturn = await authModel.SelectAll();
        for (let value of resReturn[0]) {
            rawArray.push([value.userid, value.name])
        }
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
        var userid = req.session.user.userid;
        var cateid= req.body.catesid;
        var hostid = req.body.hostid;
        var stc = req.body.stc;
        var rawArray = new Array();
        var resReturn =  await alarmModel.SelectAll();
        for (var i = 0; i <  resReturn[0].length; i++) {
            rawArray.push(resReturn[0][i].userid);
        }
        
        if ( rawArray.indexOf(userid) == -1 ) {
            await alarmModel.SetNewAlarm(userid, cateid, hostid, stc);
        } else {
            await alarmModel.UpdateAlarm(userid, cateid, hostid, stc);
        }
        res.status(200).send(true)
    } catch (err) {
        console.log(err);
        res.status(500).send(false)
    }
});



module.exports = router;
