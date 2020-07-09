var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var alarmModel = require('../public/javascripts/components/alarmModel.js');
var functions = require('../public/javascripts/functions/functions.js');

// Main Page LatestGroup, Search Group, MyGroup
router.get('/instanceaction', async (req, res) => {
    try {
        //        var returnArray = new Array();
        //       var apiArray = new Array();
        //        var listArray = new Array();
        //        var rewardsArray = new Array();
        //        var rawObj = new Object();
        //        var dateString = await functions.DateCreator();
        //        var resUG = await groupModel.GetParticipantsUserGroups(dateString);
        //        var unlockAPI = await fetch('http://api.santavision.net:8500/unlock', {
        //            method: 'POST',
        //            headers: {
        //                'Content-Type': 'application/json',
        //            },
        //            body: JSON.stringify(resUG)
        //        });

//        var ujson = await unlockAPI.json();
//        console.log('ujson', ujson)
//        if (ujson.result == true) {
//            console.log('Unlock request Complete : ', ujson)
//        }
	var resAPI = await fetch('http://api.santavision.net:8500/check/balance', {
           method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'stc', address: 'SPq6SsMAUnEDRah6tLkum1rZc77qxHBYxc', pin: 5813 })
        })
        let json = await resAPI.json();
        console.log('Able Balance : ', json);
        if (json.result == true) {
           console.log('', json)
        }
	res.status(200).send(json);
    } catch (err) {
        console.log(err)
    }
})

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
});

router.post('/creategroup', async (req, res) => {
    try {
        var resResult = new Object();
        var userid = req.session.user.userid;
        var wallet = req.session.user.wallet;
        var pin = req.session.user.pin;
        // Check Who Request to Make Group Using Session.
        // Insert Userid into dataSet.
        var dataSet = new Object();
        // var storyid = await groupModel.CreateNewStoried(req.body.story);
        dataSet = {
            userid: userid,
            catesid: req.body.catesid,
            storyid: null,
            groupsid: null,
            name: req.body.name,
            stc: req.body.stc,
            period: req.body.period
        }
        var total = parseInt(dataSet.stc) * parseInt(dataSet.period);
        // Request Santa Wallet Lock Up to Santa Wallet API
        var resAPI = await fetch('http://api.santavision.net:8500/check/balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'stc', address: wallet, pin: pin })
        })
        let json = await resAPI.json();
        console.log(json)
        resResult = {
            flags: 2,
            message: '계모임 생성에 실패하였습니다'
        }
        if (total <= json.data.balance) {
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
            //After Receive Lock Up Complete Response
            var lockAPI = await fetch('http://api.santavision.net:8500/lock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendObj)
            });

            var lockJson = await lockAPI.json();
            console.log(lockJson)
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
        // Alarm
        // await alarmModel.ChangeAlarmStatus(dataSet.catesid, dataSet.userid, dataSet.stc);

        res.status(200).send(resResult)
    } catch (err) {
        console.log(err)
    }
});

router.post('/search', async (req, res) => {
    try {
        // Receive Catesid, Hostname, Groupname From Front-End
        var reqCode = null;
        var reqCates = null;
        var reqGroups = null;
        var dataSet = new Object();
        var rawArray = new Array();

        // Distinguish There are Catesid, Hostname, Groupname or Not
        // 
        if (req.body.name != null) {
            reqCode = await authModel.GetMembersCode(req.body.name);
        } else {
            reqCode = null;
        }
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

        // Get All GroupList & Arrange Data into Array 
        var groupsList = await groupModel.GetAllStatusOn();
        for (let value of groupsList) {
            rawArray.push({ groupsid: value.groupsid, catesid: value.catesid, userid: value.userid, groupname: value.groupname })
        }

        // SearchBox Component receive rawArray Which Arranged to Make JSON Structure & dataSet Which Act Like Filter is the Data From Front-End
        var resSearch = await functions.SearchBox(rawArray, dataSet);
        console.log(resSearch);
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
        var groupsid = req.body.groupsid;
        var userid = req.session.user.userid;
        var rawArray = new Array();
        var resReturn = await groupModel.GetGroupdatas([groupsid])
        var wallet = await authModel.GetWallet(userid);
        var endDate = new Date(parseInt(resReturn[0].date.substring(0, 4)), parseInt(resReturn[0].date.substring(4, 6)) - 1, parseInt(resReturn[0].date.substring(6, 8)) + 15).toISOString().split('T')[0] + ' 23:59:59';
        var totalSTC = parseInt(resReturn[0].stc) * parseInt(resReturn[0].period);
        var resResult = false;
        rawArray.push({ coinWalletAddress: wallet, amount: totalSTC, endDate: endDate });
        var resObj = new Object();
        resObj.list = rawArray;
        resObj.partnerCode = 'SOCIALADE';

        console.log('resObj', resObj)
        var preJoined = await groupModel.GetParticipantsList(groupsid, userid);
        console.log('aa');
        if (preJoined.flags == 1) {
            console.log('b');
            var resAPI = await fetch('http://api.santavision.net:8500/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resObj)
            })
            let json = await resAPI.json();

            if (json.result == true) {
                console.log('canceljoin', json.result);
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
        var userid = req.session.user.userid;
        var wallet = req.session.user.wallet;
        var pin = req.session.user.pin;
        var resResulta = false;
        var resResult = new Object();
        resResult = {
            flags: 0,
            message: '계모임 참가에 실패하였습니다'
        }
        // Get Participants List From ts_participants Table Using groupsid, userid 
        // To Check user who request to join the group whether already joined or not.
        var preJoined = await groupModel.GetParticipantsList(req.body.groupsid, userid);

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
                // Check Balnace Complete.
                // Put variable groupsid Into Array & Create dateString
                // dateString Which is used to communicate with Santa_Wallet API AS a Parameter 

                var groupsid = [req.body.groupsid];
                var period = await groupModel.GetGroupdatas(groupsid);
                totalParticipants = period[0].period;
                var total = parseInt(period[0].stc) * parseInt(period[0].period);
                console.log(total);
                var year = parseInt(period[0].date.substring(0, 4));
                var month = parseInt(period[0].date.substring(4, 6));
                var day = parseInt(period[0].date.substring(6, 8));
                var dateString = new Date(year, month - 1, day + 15).toISOString().split('T')[0];
                var endDate = dateString + " 23:59:59";
                console.log('endDate', endDate)

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
                resResult = {
                    flags: 1,
                    message: '잔액이 부족합니다'
                }
                if (total <= json.data.balance) {
                    let lockAPI = await fetch('http://api.santavision.net:8500/lock', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(sendObj)
                    })

                    var lockJson = await lockAPI.json();
                    if (lockJson.result == true) {
                        var count = await groupModel.ParticipantInGroup(groupsid, userid, totalParticipants);
                        resResult = {
                            flags: 2,
                            message: '계모임에 참가하셨습니다'
                        }
                        // If Count == totalParticipants, Server Will INSERT 
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

                            // Lock Again Complete Check
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
