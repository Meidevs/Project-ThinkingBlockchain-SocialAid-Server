var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');

// Main Page LatestGroup, Search Group, MyGroup

router.get('/grouplist', async (req, res) => {
    try {
        // Ask Database to Gather Every Group Lists that Value of Status Column is Zero.
        var resReturn = await groupModel.GetAllListOnStatus();
        res.status(200).send(resReturn)
    } catch (err) {
        console.log(err);
        res.status(500).send(false)
    }
})

router.post('/creategroup', async (req, res) => {
    try {
        // Check Who Request to Make Group Using Session.
        // Insert Userid into dataSet.
        // Request Santa Wallet Lock Up to Santa Wallet API

        var dataSet = new Object();
        var storyid = await groupModel.CreateNewStoried(req.body.story);

        dataSet = {
            userid: 'U20200525001',
            catesid: 'C3',
            storyid: storyid,
            groupsid: null,
            name: req.body.name,
            stc: req.body.stc,
            period: req.body.period
        }

        //After Receive Lock Up Complete Response
        await groupModel.CreateNewGroups(dataSet);
        res.status(200).send(true)
    } catch (err) {
        console.log(err)
        res.status(500).send(false)
    }
});

router.post('/search', async (req, res) => {
    try {
        // Receive Catesid, Hostname, Groupname From Front-End
        var reqCode;
        var reqCates;
        var reqGroups;
        var dataSet = new Object();
        var rawArray = new Array();

        if (req.body.name) {
            reqCode = await authModel.GetMembersCode(req.body.name);
        } else {
            reqCode = null;
        }

        if (req.body.catesid) {
            reqCates = req.body.catesid
        } else {
            reqCates = null;
        }

        if (req.body.groupname) {
            reqGroups = req.body.groupname
        } else {
            reqGroups = null;
        }

        dataSet = {
            catesid: reqCates,
            name: reqCode,
            groupname: reqGroups,
        }

        // Get All GroupList
        var groupsList = await groupModel.GetAllStatusOn();

        for (let value of groupsList[0]) {
            rawArray.push([value.groupsid, value.catesid, value.userid, value.groupname])
        }
        for (var i = 0; i < rawArray.length; i++) {
            if (rawArray[i][1] == dataSet.catesid) {
                if (rawArray[i][2] == dataSet.name) {
                    if (rawArray[i][3] == dataSet.groupname) {
                        var groupsCode = rawArray[i][0];
                    }
                } else {
                    if (rawArray[i][3] == dataSet.groupname) {
                        var groupsCode = rawArray[i][0];
                    }
                }
            } else {
                if (rawArray[i][2] == dataSet.name) {
                    if (rawArray[i][3] == dataSet.groupname) {
                        var groupsCode = rawArray[i][0];
                    }
                } else {
                    if (rawArray[i][3] == dataSet.groupname) {
                        var groupsCode = rawArray[i][0];
                    }
                }
            }
        }
        console.log('groupsCode', groupsCode)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
});


module.exports = router;
