var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var functions = require('../public/javascripts/functions/functions.js');

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
            userid: 'U20200525002',
            catesid: 'C1',
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

        // Distinguish There are Catesid, Hostname, Groupname or Not
        // 
        if (req.body.name != null) {
            console.log(req.body.name)
            reqCode = await authModel.GetMembersCode(req.body.name);
        } else {
            reqCode = null;
        }

        reqCates = req.body.catesid;
        reqGroups = req.body.groupname;

        dataSet = {
            catesid: reqCates,
            userid: reqCode,
            groupname:reqGroups,
        }

        // Get All GroupList & Arrange Data into Array 
        var groupsList = await groupModel.GetAllStatusOn();
        for (let value of groupsList[0]) {
            rawArray.push({groupsid : value.groupsid, catesid : value.catesid, userid : value.userid, groupname : value.groupname})
        }

        // SearchBox Component receive rawArray Which Arranged to Make JSON Structure & dataSet Wich Act Like Filter is the Data From Front-End
        var resSearch = await functions.SearchBox(rawArray, dataSet);
        
        var resReturn = await groupModel.GetGroupdatas(resSearch)
        res.status(200).send(resReturn)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
});


module.exports = router;
