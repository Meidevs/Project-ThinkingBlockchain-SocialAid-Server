var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var rewardsModel = require('../public/javascripts/components/rewardModel.js');
var functions = require('../public/javascripts/functions/functions.js');

router.get('/groupstatus', async (req, res) => {
    try {
        var groupsidList = new Array();
        var dataSet = new Object();

        // Transfer Total STC, Revenue, Balance, Profit, Repayment, Groups Count, Total STC Annually & Monthly
        dataSet = {
            totalSTC: null,
            revenue: null,
            balance: null,
            profit: null,
            repayment: null,
            count: null,
            annually: null,
            monthly: null,
        }
        var userid = req.session.user.userid;

        // Extract groupsid List Using Userid Which Stored in Session Storage.
        var list = await groupModel.GetAllJoinedList(userid);
        for (var i = 0; i < list[0].length; i++) {
            groupsidList.push(list[0][i].groupsid);
        }
        console.log(groupsidList)
        // Get All of STC From Groups Table & Sum All of STC.
        var stcReturn = await rewardsModel.GetAllSTC(groupsidList);
        var stcSum = stcReturn.reduce(function (preValue, currentValue) {
            return (preValue + currentValue)
        });
        // Get All of Revenue From Groups Table & Calculate Revenue.
        var revReturn = await rewardsModel.GetAllRevenue(groupsidList, userid);
        var revSum = revReturn.reduce(function (preValue, currentValue) {
            return (preValue + currentValue)
        });

        // Get Balance From Santa Wallet

        // Get Profit Of Period From Rewards Table.
        var reProfit = await rewardsModel.GetAllProfit(userid)
        var repSum = reProfit.reduce(function (preValue, currentValue) {
            return (preValue + currentValue)
        });

        // Get Repayment From Groups Table.
        var repReturn = await rewardsModel.GetAllRepayment(groupsidList)
        var repaSum = repReturn.reduce(function (preValue, currentValue) {
            return (preValue + currentValue)
        });
        // Get Groups Count From Participants Table.
        var cntReturn = await groupModel.GetAllJoinedList(userid);
        cnt = cntReturn[0].length;

        dataSet.totalSTC = stcSum;
        dataSet.revenue = revSum;
        dataSet.profit = repSum;
        dataSet.repayment = repaSum;
        dataSet.count = cnt;
        res.status(200).send(dataSet)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
});

router.get('/groupstatus/detail', async (req, res) => {
    try {
        var userid = req.session.user.userid;
        var dataSet = new Object();
        var rawArray = new Array();
        var joinArray = new Array();
        var list = await groupModel.GetAllJoinedList(userid);

        // Extract Only Groupsid From participants Table Using GetAllJoinedList Function.
        for (var i = 0; i < list[0].length; i++) {
            rawArray.push(list[0][i].groupsid)
        }

        // Get Groupsid Which created by Self
        var hostArray = await groupModel.GetHostGroupList(list[0]);

        // Differentiate between Self-Made and Non-Made Groupsid
        for (var x = 0; x < rawArray.length; x++) {
            for (var y = 0; y < hostArray.length; y++) {
                if (rawArray[x] != hostArray[y]) {
                    joinArray.push(rawArray[x])
                }
            }
        }
        
        // HostArray :
        // JoinArray : 
        // Differentiate Waiting (status = 0), Ongoing (status = 1), Done (status = 2);

        if (num = 0) {
            await groupModel.GetGroupsListBasedOnStatus()
        } else if (num = 1) {
            await groupModel.GetGroupsListBasedOnStatus()
        } else {
            await groupModel.GetGroupsListBasedOnStatus()
        }

        dataSet = {
            host: resReturn,
        }
    } catch (err) {

    }
})

module.exports = router;