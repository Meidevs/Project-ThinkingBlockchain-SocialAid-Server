var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');

// Main Page LatestGroup, Search Group, MyGroup

router.get('/grouplist', async (req, res) => {
    try {
        // Ask Database to Gather Every Group Lists that Value of Status Column is Zero.
        var resReturn = await groupModel.GetAllListOnStatus();
        console.log(resReturn)
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
        await groupModel.CreateNewStoried(req.body.story);

        dataSet = {
            userid: 'U2020051',
            catesid : 'C3',
            story: req.body.story,
            groupsid: null,
            name: req.body.name,
            stc: req.body.stc,
            period: req.body.period
        }


        //After Receive Lock Up Complete Response
        await groupModel.CreateNewGroups(dataSet);
    } catch (err) {
        console.log(err)
        res.status(500).send(false)
    }
});



module.exports = router;
