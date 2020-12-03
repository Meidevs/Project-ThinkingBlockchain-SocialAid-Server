var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var alarmModel = require('../public/javascripts/components/alarmModel.js');
var functions = require('../public/javascripts/functions/functions.js');

// Main Page LatestGroup, Search Group, MyGroup
// router.get('/instanceaction', async (req, res) => {
//     try {
//                var returnArray = new Array();
//               var apiArray = new Array();
//                var listArray = new Array();
//                var rewardsArray = new Array();
//                var rawObj = new Object();
//                var dateString = await functions.DateCreator();
//                var resUG = await groupModel.GetParticipantsUserGroups(dateString);
//                var unlockAPI = await fetch('http://api.santavision.net:8500/unlock', {
//                    method: 'POST',
//                    headers: {
//                        'Content-Type': 'application/json',
//                    },
//                    body: JSON.stringify(resUG)
//                });

//        var ujson = await unlockAPI.json();
//        console.log('ujson', ujson)
//        if (ujson.result == true) {
//            console.log('Unlock request Complete : ', ujson)
//        }
// 	var resAPI = await fetch('http://api.santavision.net:8500/check/balance', {
//            method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ type: 'stc', address: 'SPq6SsMAUnEDRah6tLkum1rZc77qxHBYxc', pin: 5813 })
//         })
//         let json = await resAPI.json();
//         console.log('Able Balance : ', json);
//         if (json.result == true) {
//            console.log('', json)
//         }
// 	res.status(200).send(json);
//     } catch (err) {
//         console.log(err)
//     }
// })

router.get('/grouplist', async (req, res) => {
    try {
        // When Main Screen loaded, grouplist API calls a list of groups that can participate;
        // Ask the database to collect a list of all groups with a value of Zero in the status column;
        // In this case, status : 0 means that the group is gathering participants;
        var resReturn = await groupModel.GetAllListOnStatus();
        console.log(resReturn)
        res.status(200).send(resReturn)
    } catch (err) {
        console.log(err);
        res.status(500).send(false)
    }
});

router.post('/creategroup', async (req, res) => {
    try {
        // When AddScreen requests to create a group, creategroup API creates a new group;
        // API gets catesid (category ID), group name (name), stc (stc), period (period) as a parameter;
        // Also, API gets user session data such as userid, wallet (address), pin (pin number);
        var resResult = new Object();
        var userid = req.session.user.userid;
        var wallet = req.session.user.wallet;
        var pin = req.session.user.pin;
        // Check Who Request to Make Group Using Session.
        // Insert Userid into dataSet.
        var dataSet = new Object();
        dataSet = {
            userid: userid,
            catesid: req.body.catesid,
            storyid: null,
            groupsid: null,
            name: req.body.name,
            stc: req.body.stc,
            period: req.body.period
        }
        // End-point calculates thhe total cost for creating a new groups;
        // This is because Santa Wallet API checks if there is enough stc to create a new group;
        var total = parseInt(dataSet.stc) * parseInt(dataSet.period);

        // Request Santa Wallet Lock Up to Santa Wallet API
        var resAPI = await fetch('http://api.santavision.net:8500/check/balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'stc', address: wallet, pin: pin })
        });
        // Santa Wallet check balance API result;
        let json = await resAPI.json();
        console.log(json)
        resResult = {
            flags: 2,
            message: '계모임 생성에 실패하였습니다'
        }
        // According to result of Santa Wallet API, in case of "total < balance" , a new group can be created;
        if (total <= json.data.balance) {

            // This is for setting due date to Santa Wallet API. creategroup API requests Santa Wallet API to lock the wallet for a certain amount of stc by the deadline;
            // If there don't have enough participants to start the group by the deadline, unlock the user's wallet after the deadline;
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();
            var day = now.getDate();
            var dateString = new Date(year, month, day + 15).toISOString().split('T')[0];
            var duedate = dateString + ' 23:59:59';
            console.log(duedate)
            var sendObj = new Object();
            sendObj = {
                list: [
                    {
                        coinWalletAddress: wallet,
                        amount: total,
                        endDate: duedate,
                    }
                ],
                partnerCode: 'SOCIALADE'
            }
            // Request to lock Santa Wallet;
            var lockAPI = await fetch('http://api.santavision.net:8500/lock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendObj)
            });

            var lockJson = await lockAPI.json();
            console.log(lockJson)
            // When Santa Wallet is locked, the response value is true;
            // And creategroup API stores group information to the database;
            if (lockJson.result == true) {
                var storyid = await groupModel.CreateNewStoried(req.body.story);
                dataSet.storyid = storyid;
                await groupModel.CreateNewGroups(dataSet);
                resResult = {
                    flags: 1,
                    message: '계모임을 생성하였습니다'
                }
            }
        } else {
            resResult = {
                flags: 0,
                message: '잔액이 부족합니다'
            }
        }
        res.status(200).send(resResult)
    } catch (err) {
        console.log(err)
    }
});

router.post('/search', async (req, res) => {
    try {
        // The search API receives catesid (reqCates), username  (reqCode), groupname (reqGroups) as a parameter;
        // So, the search API finds a list of groups based on catesid, username, and groupname;
        var reqCode = null;
        var reqCates = null;
        var reqGroups = null;
        var dataSet = new Object();
        var rawArray = new Array();

        // It checks for the name and if there is user code that matches the name, it saves the return value in reqCode;
        if (req.body.name != null) {
            reqCode = await authModel.GetMembersCode(req.body.name);
        } else {
            reqCode = null;
        }
        // If reqCates is "cates", Front-End didn't select a category;
        if (reqCates = 'cates') {
            reqCates = null
        }
        reqCates = req.body.catesid;
        reqGroups = req.body.groupname;
        console.log('reqCode', reqCode);
        console.log('reqCates', reqCates);
        console.log('reqGroups', reqGroups);
        dataSet = {
            catesid: reqCates,
            userid: reqCode,
            groupname: reqGroups,
        }

        // The GetAllStatusOn function calls all groups in the database where the status column has a value of Zero;
        // And, Use the groupsList variable to sort the return value in the database;
        var groupsList = await groupModel.GetAllStatusOn();
        for (let value of groupsList) {
            rawArray.push({ groupsid: value.groupsid, catesid: value.catesid, userid: value.userid, groupname: value.groupname })
        }

        // The SearchBox function receives dataSet and rawArray;
        var resSearch = await functions.SearchBox(rawArray, dataSet);
        console.log(resSearch);
        // The GetGroupdatas function receives an array of search results;
        // The GetGroupdatas function calls a list of groups matching groupsid;
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

        // If value of Groups Table of userid Column is same as User in Session Storage, flags = 1;
        // GetParticipantsList Function is to Get Participants From Participant Table & Check Whether User Aleady Joined or Not Using groupsid & userid;
        // If userid Of User is in the Participants Table, flags = 2;
        // If It isn't the Case above, flags = 0;
        // "flags = 0" : Not join
        // "flags = 1" : Owner of Group
        // "flags = 2" : Already Join the Group
        var reCount = await groupModel.GetParticipantsCount(groupsid);
        var returnExist = await groupModel.GetParticipantsList(groupsid, user);
        var resReturn = await groupModel.GetGroupdatas(groupsid);

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
        res.status(200).send({
            flags: flags,
            groupsid: resReturn[0].groupsid,
            host: resReturn[0].host,
            cates: resReturn[0].cates,
            story: resReturn[0].story,
            groupname: resReturn[0].groupname,
            date: resReturn[0].date,
            stc: resReturn[0].stc,
            tstc: (parseInt(resReturn[0].stc) * parseInt(resReturn[0].period)),
            period: resReturn[0].period,
            participants: reCount
        })
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
        var resResult = false;
        // Paste Santa Wallet Unlock Request, Here
        var walletList = await groupModel.GetWalletList(groupsid);

        var preJoined = await groupModel.GetParticipantsList(groupsid, userid);
        if (preJoined.flags == 1) {

            var resAPI = await fetch('http://api.santavision.net:8500/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(walletList)
            })
            let json = await resAPI.json();
            console.log('cancel join', json);
            if (json.result == true) {
                resResult = true;
                //After Getting Unlock Process is Complete, Server will Ask Database to Change Status of Groups Table & Remove the Tuple From Participants Table .
                await groupModel.ChangeStatusDeprecated(groupsid);
                await groupModel.RemoveTupleParticipantsList(groupsid);
            }
        }
        res.status(200).send(resResult)
    } catch (err) {
        console.log(err);
        res.status(500).send(resResult)
    }
});

router.post('/canceljoin', async (req, res) => {
    try {
        // The canceljoin API receives groupsid as a parameter from Front-End;
        // Also, brings the userid from user session storage;
        var groupsid = req.body.groupsid;
        var userid = req.session.user.userid;
        var rawArray = new Array();

        // By passing the groupsid to the GetGroupdatas, the canceljoin API gets simple information of group;
        // Also, canceljoin API calls user wallet address using the userid;
        var resReturn = await groupModel.GetGroupdatas([groupsid])
        var wallet = await authModel.GetWallet(userid);

        // endData is a variable that initialize the wallet expiration date;
        var endDate = new Date(parseInt(resReturn[0].date.substring(0, 4)), parseInt(resReturn[0].date.substring(4, 6)) - 1, parseInt(resReturn[0].date.substring(6, 8)) + 15).toISOString().split('T')[0] + ' 23:59:59';

        // totalSTC is a variable for the amount of stc requesting Santa Wallet API to unlock;
        var totalSTC = parseInt(resReturn[0].stc) * parseInt(resReturn[0].period);
        var resResult = false;

        // The rawArray has parameters passed to the Santa Wallet API;
        // resObj is an object sent to the Santa Wallet API;
        rawArray.push({ coinWalletAddress: wallet, amount: totalSTC, endDate: endDate });
        var resObj = new Object();
        resObj.list = rawArray;
        resObj.partnerCode = 'SOCIALADE';

        console.log('resObj', resObj)

        // The GetParticipantsList function checks for the presence of users in a group;
        // This function is to prevent users from requesting the same request multiple times;
        var preJoined = await groupModel.GetParticipantsList(groupsid, userid);

        // If the return value of GetParticipantsList is 1, the canceljoin API requests to the Santa Wallet API to unlock;
        if (preJoined.flags == 1) {
            var resAPI = await fetch('http://api.santavision.net:8500/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resObj)
            })
            let json = await resAPI.json();

            // Finally, if Santa Wallet API's return value is true, the CancelJoin function will update the group data to G000000 and U000000;
            if (json.result == true) {
                var resResult = true;
                await groupModel.CancelJoin(groupsid, userid)
            }
        }
        res.status(200).send(resResult);
    } catch (err) {
        console.log(err)
        res.status(500).send(resResult)
    }
});

router.post('/joingroup', async (req, res) => {
    try {

        // The joingroup brings the userid, wallet(address), pin from user session storage;
        var userid = req.session.user.userid;
        var wallet = req.session.user.wallet;
        var pin = req.session.user.pin;
        var resResulta = false;
        var resResult = new Object();
        resResult = {
            flags: 0,
            message: '계모임 참가에 실패하였습니다'
        }
        // The joingroup API receives the groupsid parameter from the Front-End;
        // The GetParticipantsList function checks for the presence of users in a group;
        // This function is to prevent users from requesting the same request multiple times;
        var preJoined = await groupModel.GetParticipantsList(req.body.groupsid, userid);

        // If the return value of GetParticipantsList is not 1, the joingroup API requests to the Santa Wallet API to lock and check the balance;
        if (preJoined.flags != 1) {
            // Santa API Wallet Balance Check Request,
            var resAPI = await fetch('http://api.santavision.net:8500/check/balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: 'stc', address: wallet, pin: pin })
            })
            let json = await resAPI.json();
            console.log('Able Balance : ', json.data.balance)
            if (json.result == true) {
                var groupsid = [req.body.groupsid];

                // The group has different numbers of participants depending on the duration;
                // If the period is 10 days, participants is also 10;
                // It means that the period is participants;
                var period = await groupModel.GetGroupdatas(groupsid);
                totalParticipants = period[0].period;

                // total is a variable for the amount of stc requesting Santa Wallet API to unlock;
                var total = parseInt(period[0].stc) * parseInt(period[0].period);

                // endData is a variable that initialize the wallet expiration date;
                var year = parseInt(period[0].date.substring(0, 4));
                var month = parseInt(period[0].date.substring(4, 6));
                var day = parseInt(period[0].date.substring(6, 8));
                var dateString = new Date(year, month - 1, day + 15).toISOString().split('T')[0];
                var endDate = dateString + " 23:59:59";
                console.log('endDate', endDate)
                // sendObj is an object sent to the Santa Wallet API;
                var sendObj = new Object();
                sendObj = {
                    list: [
                        {
                            coinWalletAddress: wallet,
                            amount: total,
                            endDate: endDate,
                        }
                    ],
                    partnerCode: 'SOCIALADE'
                }
                // If "total" is lower than "json.data.balance", the joingroup will send '잔액이 부족합니다' as a response;
                resResult = {
                    flags: 1,
                    message: '잔액이 부족합니다'
                }
                // If "total" is more than "json.data.balance", the joingroup will request lock the wallet;
                if (total <= json.data.balance) {
                    let lockAPI = await fetch('http://api.santavision.net:8500/lock', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(sendObj)
                    })

                    var lockJson = await lockAPI.json();
                    // After the wallet lock is complete, the ParticipantsInGroup function puts userid into the database;
                    // And, it returns the number of participants in the group;
                    // This count will be used to request Santa Wallet API to update deadline, and changing status of group; 
                    if (lockJson.result == true) {
                        var count = await groupModel.ParticipantInGroup(groupsid, userid, totalParticipants);
                        resResult = {
                            flags: 2,
                            message: '계모임에 참가하셨습니다'
                        }
                        // If Count == totalParticipants, the GetWalletList function gets a list of wallet addresses from the database and sends it to the Santa Wallet API to unlock them;
                        if (count == totalParticipants) {
                            var walletList = await groupModel.GetWalletList(groupsid);
                            var unlock_2 = await fetch('http://api.santavision.net:8500/unlock', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(walletList)
                            })
                            var unlockJson = await unlock_2.json();

                            // After requesting Santa Wallet API to unlock wallets, the joingroup API requests Santa Wallet API to lock the wallet again;
                            // This is because updating deadline to old one to new one;
                            if (unlockJson.result == true) {
                                var now = new Date();
                                var a = new Date(now.getFullYear(), now.getMonth(), now.getDate() + totalParticipants);
                                var yd = a.getFullYear();
                                var md = a.getMonth() + 1;
                                var dd = a.getDate();
                                var duedate = yd + '-' + md + '-' + dd + ' 23:59:59';
                                console.log('last duedate', duedate)
                                for (var i = 0; i < walletList.list.length; i++) {
                                    walletList.list[i].endDate = duedate;
                                }
                                var locka = await fetch('http://api.santavision.net:8500/lock', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(walletList)
                                })

                                var lockaJson = await locka.json();
                                console.log(lockaJson);
                                // If Santa Wallet API locks wallet successfully, the GroupsRun function updates the status column 0 to 1; 
                                if (lockaJson.result == true) {
                                    await groupModel.GroupsRun(groupsid, totalParticipants)
                                }
                            }
                        }
                    }
                }
            }
        }
        res.status(200).send(resResult);
    } catch (err) {
        console.log(err)
    }
});

module.exports = router;
