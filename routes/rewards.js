var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var rewardsModel = require('../public/javascripts/components/rewardModel.js');
var functions = require('../public/javascripts/functions/functions.js');

router.get('/groupstatus', async (req, res) => {
    try {
        var groupsidList = new Array();
        var rawArray = new Array();
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

        // Get Monthly Reward Data
        var mReturn = await rewardsModel.DateRewards(userid);
        for (var i = 0; i < mReturn.length; i++) {
            rawArray.push(mReturn[i].annually);
        }
        var rawArray = rawArray.filter((item, index) => rawArray.indexOf(item) == index);

        var yearArray = new Array();
        var monthArray = new Array();

        for (var x = 0; x < rawArray.length; x++) {
            var insObj = new Object();
            var insObj_2 = new Object();
            var sum = 0;
            insObj = {
                year: rawArray[x],
                total: null,
            }
            insObj_2 = {
                year: rawArray[x],
                month: null,
                total: null,
            }
            for (var i = 0; i < mReturn.length; i++) {
                if (rawArray[x] == mReturn[i].annually) {
                    sum += mReturn[i].total;
                }
            }
            insObj.total = sum;
            yearArray.push(insObj);
        }

        dataSet.totalSTC = stcSum;
        dataSet.revenue = revSum;
        dataSet.profit = repSum;
        dataSet.repayment = repaSum;
        dataSet.count = cnt;
        dataSet.annually = yearArray;
        dataSet.monthly = mReturn;
        res.status(200).send(dataSet)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
});

router.get('/groupstatus/detail/:id', async (req, res) => {
    try {
        var params = req.params;
        console.log(params)
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
        var hostReturn = await groupModel.GetGroupdatas(hostArray);
        var joinReturn = await groupModel.GetGroupdatas(joinArray);
        dataSet = {
            host : [],
            join : [],
        }
        if (params.id == 'waiting') {
            var insArray_1 = new Array();
            var insArray_2 = new Array();

            hostReturn.forEach(item => {
                if (item.status == 0) {
                    insArray_1.push(item)
                }
            });
            joinReturn.forEach(item => {
                if (item.status == 0) {
                    insArray_2.push(item)
                }
            });
            dataSet = {
                host : insArray_1,
                join : insArray_2
            }
        } else if (params.id == 'ongoing') {
            var insArray_1 = new Array();
            var insArray_2 = new Array();

            hostReturn.forEach(item => {
                if (item.status == 1) {
                    insArray_1.push(item)
                }
            });
            joinReturn.forEach(item => {
                if (item.status == 1) {
                    insArray_2.push(item)
                }
            });
            dataSet = {
                host : insArray_1,
                join : insArray_2
            }
        } else if (params.id == 'done') {
            var insArray_1 = new Array();
            var insArray_2 = new Array();

            hostReturn.forEach(item => {
                if (item.status == 2) {
                    insArray_1.push(item)
                }
            });
            joinReturn.forEach(item => {
                if (item.status == 2) {
                    insArray_2.push(item)
                }
            });
            dataSet = {
                host : insArray_1,
                join : insArray_2
            }
        }
        res.status(200).send(dataSet);
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})

module.exports = router;