var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');

// Main Page LatestGroup, Search Group, MyGroup

router.get('/grouplist', async (req, res) => {
    try {
        
    } catch (err) {

    }
})

router.post('/addgroup', async (req, res) => {
    try {
        // Check Who Request to Make Group Using Session.
        // Insert Userid into dataSet.
        console.log(req.body)
        var dataSet = new Object();
        dataSet = {
            userid : 'test1@test.com',
            storyid : 'a',
            groupsid : null,
            name : req.body.name,
            stc : req.body.stc,
            cates : req.body.cates,
            days : req.body.days
        }
        await groupModel.CreateNewGroups(dataSet);
    } catch (err) {
        console.log(err)
        res.status(500).send(false)
    }
});



module.exports = router;
