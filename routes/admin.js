var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var functions = require('../public/javascripts/functions/functions.js');
var alarmModel = require('../public/javascripts/components/alarmModel.js');


router.get('/getnotice', async (req, res) => {
    try {
        var resReturn = await alarmModel.GetAllNotice();
        console.log(resReturn[0].date)
        for (var i =0; i < resReturn.length; i++) {
            resReturn[i].date = resReturn[i].date.substring(0,10)
            resReturn[i].visible = false;
        }
        res.status(200).send(resReturn)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)

    }
});

router.post('/insertnotice', async (req, res) => {
    try {
        dataSet = {
            title : req.body.title,
            wel : req.body.wel,
            sentence_1 : req.body.sentence_1,
            sentence_2 : req.body.sentence_2,
            bye : req.body.bye,
        }

        await alarmModel.InsertNotice(dataSet);
        res.status(200).send(true)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
});

module.exports = router;
