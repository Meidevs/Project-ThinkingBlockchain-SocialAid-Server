var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');

// Main Page LatestGroup, Search Group, MyGroup

router.get('/grouplist', async (req, res) => {
    try {
        await groupModel.GetAllListOnStatus();
        res.status(200).send()
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
        dataSet = {
            userid: 'U2020053',
            storyid: 'a',
            groupsid: null,
            name: req.body.name,
            stc: req.body.stc,
            cates: req.body.cates,
            days: req.body.days
        }
        //After Receive Lock Up Complete Response
        await groupModel.CreateNewGroups(dataSet);
    } catch (err) {
        console.log(err)
        res.status(500).send(false)
    }
});



module.exports = router;
