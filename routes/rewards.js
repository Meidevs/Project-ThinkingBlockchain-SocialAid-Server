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
            totalSTC: 0,
            revenue: 0,
            balance: 0,
            profit: 0,
            repayment: 0,
            count: 0,
            annually: null,
            monthly: null,
        }
        var userid = req.session.user.userid;

        // Extract groupsid List Using Userid Which Stored in Session Storage.
        var list = await groupModel.GetAllJoinedList(userid);
        for (var i = 0; i < list.length; i++) {
            groupsidList.push(list[i].groupsid);
        }
        if (groupsidList[0] == null) {
            dataSet.totalSTC = 0;
            dataSet.revenue = 0;
            dataSet.profit = 0;
            dataSet.repayment = 0;
            dataSet.count = 0;
            dataSet.annually = [];
            dataSet.monthly = [];
        } else {
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
            if (reProfit[0] != undefined) {
                var repSum = reProfit.reduce(function (preValue, currentValue) {
                    return (preValue + currentValue)
                });
            } else {
                var repSum = 0;
            }


            // Get Repayment From Groups Table.
            var repReturn = await rewardsModel.GetAllRepayment(groupsidList)
            if (repReturn[0] != undefined) {
                var repaSum = repReturn.reduce(function (preValue, currentValue) {
                    return (preValue + currentValue)
                });
            } else {
                var repaSum = 0;
            }

            // Get Groups Count From Participants Table.
            var cntReturn = await groupModel.GetAllJoinedList(userid);
            cnt = cntReturn.length;

            // Get Reward Data
            // {
            //     [
            //         annually : data
            //         monthly : data
            //         total : data
            //     ]
            // }
            var mReturn = await rewardsModel.DateRewards(userid);

            // Extract Years From mReturn Variables, Push Years to raw Array.
            // Remove Duplicates Variables in rawArray using filter Function.
            for (var i = 0; i < mReturn.length; i++) {
                rawArray.push(mReturn[i].annually);
            }
            var rawArray = rawArray.filter((item, index) => rawArray.indexOf(item) == index);

            var now = new Date();
            var yearArray = new Array();

            var nowYear = now.getFullYear();
            for (var i = nowYear - 3; i <= nowYear + 3; i++) {
                var insObj = new Object();

                insObj.year = i;
                yearArray.push(insObj);

            }
            for (var i = 0; i < yearArray.length; i++) {
                var rawArray = [];

                for (var j = 1; j <= 12; j++) {
                    rawArray.push({ month: j, total: 0 })
                }
                yearArray[i].month = rawArray
            }

            yearArray.map((data) => {
                for (var i = 0; i < mReturn.length; i++) {
                    if (data.year == mReturn[i].annually) {
                        for (var j = 0; j < data.month.length; j++) {
                            if (data.month[j].month == mReturn[i].monthly) {
                                data.month[j].total = mReturn[i].total;
                            }
                        }
                    }
                }
            })
            var annually = await functions.YearCalculator(yearArray)
            var monthly = await functions.MonthCalculator(yearArray)
            dataSet.totalSTC = stcSum;
            dataSet.revenue = revSum;
            dataSet.profit = repSum;
            dataSet.repayment = repaSum;
            dataSet.count = cnt;
            dataSet.annually = annually;
            dataSet.monthly = monthly;
        }

        res.status(200).send(dataSet)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
});

router.get('/groupstatus/detail/:id', async (req, res) => {
    try {
        var params = req.params;
        var userid = req.session.user.userid;
        var dataSet = new Object();
        var joinArray = new Array();
        var list = await groupModel.GetAllJoinedList(userid);
        // Extract Only Groupsid From participants Table Using GetAllJoinedList Function.
        for (var i = 0; i < list.length; i++) {
            joinArray.push(list[i].groupsid)
        }
        // Get Groupsid Which created by Self
        var hostArray = await groupModel.GetHostGroupList(list);

        for (var i = 0; i < hostArray.length; i++) {
            const idx = joinArray.indexOf(hostArray[i])
            if (idx > -1) joinArray.splice(idx, 1)
        }
        // HostArray :
        // JoinArray : 
        // Differentiate Waiting (status = 0), Ongoing (status = 1), Done (status = 2);
        var hostReturn = await groupModel.GetGroupdatas(hostArray);
        var joinReturn = await groupModel.GetGroupdatas(joinArray);
        dataSet = {
            host: [],
            join: [],
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
                host: insArray_1,
                join: insArray_2
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
                host: insArray_1,
                join: insArray_2
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
                host: insArray_1,
                join: insArray_2
            }
        }
        res.status(200).send(dataSet);
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})

module.exports = router;
