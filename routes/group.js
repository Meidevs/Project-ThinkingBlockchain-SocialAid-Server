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
            userid: req.session.user.userid,
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
            groupname: reqGroups,
        }

        // Get All GroupList & Arrange Data into Array 
        var groupsList = await groupModel.GetAllStatusOn();
        for (let value of groupsList[0]) {
            rawArray.push({ groupsid: value.groupsid, catesid: value.catesid, userid: value.userid, groupname: value.groupname })
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

router.post('/loadgroup', async (req, res) => {
    try {
        var dataSet = new Object();
        var flags;
        var groupsid = [req.body.groupsid];

        // Call User Session Data Using Session Storage
        var user = req.session.user.userid;
        var userName = req.session.user.name;
        console.log('userid : ', user)
        console.log('user name : ', userName)

        // If value of Groups Table of userid Column is same as User in Session Storage, flags = 1;
        // GetParticipantsList Function is to Get Participants From Participant Table & Check Whether User Aleady Joined or Not Using groupsid & userid;
        // If userid Of User is in the Participants Table, flags = 2;
        // If It isn't the Case above, flags = 0;
        // "flags = 0" : Not join
        // "flags = 1" : Owner of Group
        // "flags = 2" : Already Join the Group

        var returnExist = await groupModel.GetParticipantsList(groupsid, user);
        var resReturn = await groupModel.GetGroupdatas(groupsid);
        console.log('returnExist : ', returnExist)
        console.log('resReturn : ', resReturn)
        // "returExist.flags == 1" means that User Who wanna join the group had already participant in that group.
        // So, Server can get group data which User already participants in
        if (returnExist.flags == 1) {
            if (resReturn[0].host == userName) {
                flags = 1;
            } else if (returnExist.userid == user) {
                flags = 2;
            }
        } else {
            flags = 0;
        }
        // There are 3 types of Btn Form Which decided based on flags Number;
        // 1. Group Cancel : 
        // 2. Cancel Join :
        // 3. Join Group : 
        res.status(200).send({flags : flags})
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
});

router.post('/cancelgroup', async (req, res) => {
    try {
        // Get groupsid & userid From Front-End to Cancel Group. But, It doesnt mean delete Group Tuple From Groups Table.
        // Change status of Groups Table 0 to 999. It means the Group Tuple is Depricated! 
        // And Server will request Santa Wallet Server to Unlock specific Santa Wallet which Server ask to lock up
        var groupsid = req.body.groupsid;
        var userid = req.session.user.userid;

        // Paste Santa Wallet Unlock Request, Here
        var walletList = await groupModel.GetWalletList(groupsid);

        //After Getting Unlock Process is Complete, Server will Ask Database to Change Status of Groups Table & Remove the Tuple From Participants Table .
        await groupModel.ChangeStatusDeprecated(groupsid);
        var resReturn = await groupModel.RemoveTupleParticipantsList(groupsid);
        
        // res.status(200).send(resReturn)
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
});

router.post('/canceljoin', async (req, res) => {
    try {

    } catch (err) {

    }
});

router.post('/joingroup', async (req, res) => {
    try {
        //
        var userid = req.session.user.userid;
        var groupsid = req.body.groupsid;

        var period = await groupModel.GetGroupdatas(groupsid);

        totalParticipants = period[0].period;
        console.log(totalParticipants)
        // To join the Group 
        var resReturn = await groupModel.ParticipantInGroup(groupsid, userid, totalParticipants);

    } catch (err) {
    }
});

module.exports = router;
