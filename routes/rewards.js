var express = require('express');
var router = express.Router();

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var rewardsModel = require('../public/javascripts/components/rewardModel.js');
var functions = require('../public/javascripts/functions/functions.js');

router.get('/groupstatus', async (req, res) => {
    // The groupstatus API is for sending the current user status;
    // It sends user's total STC, revenue, balance, profit, repayment, endgaged group count and monthly, yearly total stc;
    try {
        var groupsidList = new Array();
        var rawArray = new Array();
        var dataSet = new Object();
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

        // The GetAllJoinedList function returns a list of groups the user has joined;
        // Then, loop function only collects the groupsid;
        var list = await groupModel.GetAllJoinedList(userid);
        for (var i = 0; i < list.length; i++) {
            groupsidList.push(list[i].groupsid);
        }

        if (groupsidList[0] == null) {
            var now = new Date();
            var yearArray = new Array();
            // If groupsidList is null, the loop function sets three year later and three year ago based on the current year;
            var nowYear = now.getFullYear();
            for (var i = nowYear - 3; i <= nowYear + 3; i++) {
                var insObj = new Object();

                insObj.year = i;
                yearArray.push(insObj);

            }

            // The loop function sets the month and initial data as a zero every year;
            for (var i = 0; i < yearArray.length; i++) {
                var rawArray = [];

                for (var j = 1; j <= 12; j++) {
                    rawArray.push({ month: j, total: 0 })
                }
                yearArray[i].month = rawArray
            }
            // YearCalaulator and MonthCalculator function puts initial data;
            var annually = await functions.YearCalculator(yearArray);
            var monthly = await functions.MonthCalculator(yearArray);

            dataSet.totalSTC = 0;
            dataSet.revenue = 0;
            dataSet.profit = 0;
            dataSet.repayment = 0;
            dataSet.count = 0;
            dataSet.annually = annually;
            dataSet.monthly = monthly;
        } else {
            // The GetAllSTC function gets all STCs from a list of groups;
            var stcReturn = await rewardsModel.GetAllSTC(groupsidList);

            // This reduce function calculates total STC;
            var stcSum = stcReturn.reduce(function (preValue, currentValue) {
                return (preValue + currentValue)
            });
            // The GetAllRevenue function gets all revenues from a list of groups;
            var revReturn = await rewardsModel.GetAllRevenue(groupsidList, userid);

            // This reduce function calculates total revenue;
            var revSum = revReturn.reduce(function (preValue, currentValue) {
                return (preValue + currentValue)
            });

            // Get Balance From Santa Wallet

            //The GetAllProfit function gets all profits from a list of groups;
            var reProfit = await rewardsModel.GetAllProfit(userid)
            // This reduce function calculates total profit;
            if (reProfit[0] != undefined) {
                var repSum = reProfit.reduce(function (preValue, currentValue) {
                    return (preValue + currentValue)
                });
            } else {
                var repSum = 0;
            }

            //The GetAllRepayment function gets all repayments from a list of groups;
            var repReturn = await rewardsModel.GetAllRepayment(groupsidList);
            // This reduce function calculates total repayments;
            if (repReturn[0] != undefined) {
                var repaSum = repReturn.reduce(function (preValue, currentValue) {
                    return (preValue + currentValue)
                });
            } else {
                var repaSum = 0;
            }

            // The GetAllJoinedList function calls the numbers of joined groups;
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
            // The DateRewards function calls a list of rewards based on year and month;
            var mReturn = await rewardsModel.DateRewards(userid);

            // Extract Years From mReturn Variables, Push Years to raw Array.
            // Remove Duplicates Variables in rawArray using filter Function.

            // The loop function gets yaers from mReturn variable and pushes years to rawArray;
            for (var i = 0; i < mReturn.length; i++) {
                rawArray.push(mReturn[i].annually);
            }

            // Then, the filter function removes the duplicates from the rawArray;
            var rawArray = rawArray.filter((item, index) => rawArray.indexOf(item) == index);

            var now = new Date();
            var yearArray = new Array();

            // The loop function sets the month and initial data as a zero every year;
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
            // Based on mReturn value, map function saves monthly, yearly datas to the mReturn;
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
            });
            // YearCalaulator and MonthCalculator function puts initial data;
            var annually = await functions.YearCalculator(yearArray);
            var monthly = await functions.MonthCalculator(yearArray);

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
        // req.params is one of "waiting", "ongoing", "done";
        var params = req.params;
        var userid = req.session.user.userid;
        var dataSet = new Object();
        var joinArray = new Array();

        // The GetAllJoinedList function calls the numbers of joined groups;
        var list = await groupModel.GetAllJoinedList(userid);
        // The loop function gets groupsid from the list which is the return value of the GetAllJoinedList function;
        for (var i = 0; i < list.length; i++) {
            joinArray.push(list[i].groupsid)
        }
        // The GetHostGroupList function calls a list of groups it has created;
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
        // The if statement seperates "waiting", "ongoing", "done",and inner statement seperates groups created by self or someone else; 
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
});

router.post('/getdetaildatas', async (req, res) => {
    try {

        // getdetaildatas API gets userid from user session storage and groupsid from Front-end;
        var userid = req.session.user.userid;
        var groupsid = req.body.groupsid;
        var rawObj = new Object();
        var creator;
        // The GetGroupdatas function calls a details of group from the tb_group table;
        // The GetDueDate function calls a deadline of group from the tb_participants table;
        // The GetRateDate function calls groups according to date order from the tb_participants table;
        var resReturn = await groupModel.GetGroupdatas([groupsid]);
        var resDueDate = await groupModel.GetDueDate(groupsid);
        var resRateDate = await groupModel.GetRateDate(userid, groupsid);

        // The createdata is the date of group was created;
        var createdate = resReturn[0].date.substring(0, 4) + '-' + resReturn[0].date.substring(4, 6) + '-' + resReturn[0].date.substring(6, 8);
        var duedate = resDueDate.toISOString().substring(0, 10);
        var ratedate = resRateDate.toISOString().substring(0, 10);

        // The if statement checks if the requesting user has created a group;
        if (userid == resReturn[0].userid) {
            creator = 1;
        } else {
            creator = 0;
        }
        rawObj = {
            groupsid: resReturn[0].groupsid,
            userid: resReturn[0].userid,
            host: resReturn[0].host,
            groupname: resReturn[0].groupname,
            stc: resReturn[0].stc,
            period: resReturn[0].period,
            createdate: createdate,
            status: resReturn[0].status,
            duedate: duedate,
            ratedate: ratedate,
            creator: creator,
        }
        res.status(200).send(rawObj);
    }
    catch (err) {
        res.status(500).send(err);
    }
})

module.exports = router;
