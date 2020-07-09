var cron = require('node-cron');
var fetch = require('node-fetch');

var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var rewardsModel = require('../public/javascripts/components/rewardModel.js');
var functions = require('../public/javascripts/functions/functions.js');

cron.schedule("00 00 * * *", async () => {
  try {
    var returnArray = new Array();
    var apiArray = new Array();
    var listArray = new Array();
    var rewardsArray = new Array();
    var rawObj = new Object();
    var dateString = await functions.DateCreator();
    var resUG = await groupModel.GetParticipantsUserGroups(dateString);
    var unlockAPI = await fetch('http://api.santavision.net:8500/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resUG)
    });

    var ujson = await unlockAPI.json();
    console.log('ujson', ujson)
    if (ujson.result == true) {
      console.log('Unlock request Complete : ', ujson)
    }

    // Get Participants List (user_seq, groupsid, participantsid, duedate) From participants Table At Duedate.
    var resReturn = await groupModel.GetParticipantsListOfDate(dateString);
    for (var i = 0; i < resReturn.length; i++) {
      var groupsidList = resReturn[i].groupsid;
      listArray.push(groupsidList)
    }
    // Remove Duplicate groupsid.
    var indexList = listArray.filter((item, index) => listArray.indexOf(item) == index);

    // Host Reward 금액 & 계원 구분하여 데이터 형성
    // indexList 로 Participants에서 userid 전체 호출
    var hostArray = await groupModel.GetHostUserList(indexList);
    var userArray = await groupModel.GetUserList(indexList);
    hostArray.map((data) => {
      for (var i = 0; i < userArray.length; i++) {
        for (var j = 0; j < userArray[i].users.length; j++) {
          var rawObj = new Object();
          rawObj = {
            coinWalletAddress: null,
            amount: null,
          }
          if (data.groupsid == userArray[i].groupsid) {
            if (data.userid == userArray[i].users[j].user_seq) {
              rawObj.coinWalletAddress = userArray[i].users[j].coin_wallet_address;
              rawObj.amount = parseInt(data.total) * 0.2 + parseInt(data.total) * 0.02;
            } else {
              rawObj.coinWalletAddress = userArray[i].users[j].coin_wallet_address;
              rawObj.amount = parseInt(data.total) * 0.02;
            }
            apiArray.push(rawObj);
          }
        }
      }
    })
    console.log('apiArray', apiArray);

    // Transfer Wallet List to Santa. 
    // Transfer Wallet Addr to Santa Wallet API
    for (var i = 0; i < indexList.length; i++) {
      rawObj = {
        groupsid: null,
        users: []
      }
      rawObj.groupsid = indexList[i]
      for (var j = 0; j < resReturn.length; j++) {
        if (indexList[i] == resReturn[j].groupsid) {
          rawObj.users.push(resReturn[j].userid)
        }
      }
      rewardsArray.push(rawObj)
    }
    var resObj = new Object();
    resObj.list = apiArray;
    resObj.partnerCode = "SOCIALADE"

    console.log(resObj);
    var rewAPI = await fetch('http://api.santavision.net:8500/compensation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resObj)
    });

    var json = await rewAPI.json();

    console.log('Compensations : ', json)
    if (json.result == true) {
      console.log('Compensation Success : ', json.result)
      await rewardsModel.InsertRewards(rewardsArray);
    }

    // Cancel the groups list which fail to assemble enough participants until 15 days.
    var Array_Before_UserWallet = new Array();
    var To_Cal_Now = new Date();
    var year = dateString.substring(0, 4);
    var month = dateString.substring(4, 6);
    var day = dateString.substring(6, 8);
    var bDateString = new Date(year, month - 1, day - 14).toISOString().split('T')[0].split('-');
    var aDateString = new Date(To_Cal_Now.getFullYear(), To_Cal_Now.getMonth(), To_Cal_Now.getDate() + 15).toISOString().split('T')[0] + ' 23:59:59';

    var dateString_15days_ago = bDateString[0] + bDateString[1] + bDateString[2];
    console.log('bDateString', dateString_15days_ago);
    console.log('aDateString', aDateString);

    var Groups_List_status_0 = await groupModel.GetAllStatusOn();

    //Select Expired Group_List.
    var Select_Groups_List_On_Duedate = Groups_List_status_0.filter((duedateString) => {
      return duedateString.date == dateString_15days_ago;
    });
    console.log('Select_Groups_List_On_Duedate', Select_Groups_List_On_Duedate);

    // Select_Groups_List_On_Duedate Variable is consist of Group Information. (Groupsid, user_seq, stc, period, etc)
    var All_Of_Participants = await groupModel.SelectAllParticipants();
    
    Select_Groups_List_On_Duedate.map((data) => {
      for (var i = 0; i < All_Of_Participants.length; i++) {
        if (data.groupsid == All_Of_Participants[i].groupsid) {
          var rawObja = new Object();
          rawObja.coinWalletAddress = All_Of_Participants[i].user_seq;
          rawObja.amount = parseInt(data.period) * parseInt(data.stc);
          rawObja.endDate = aDateString;
          Array_Before_UserWallet.push(rawObja);
        }
      }
    })

    // user_seq, email, etc
    var All_Of_Users = await authModel.SelectAll();
    All_Of_Users.map((data) => {
      for (var i = 0; i < Array_Before_UserWallet.length; i++) {
        if (data.user_seq == Array_Before_UserWallet[i].coinWalletAddress) {
          Array_Before_UserWallet[i].coinWalletAddress = data.wallet;
        }
      }
    })
    console.log('Array_Before_UserWallet', Array_Before_UserWallet);

    var sendObj = {
      list: Array_Before_UserWallet,
      partnerCode: 'SOCIALADE'
    }
    console.log('sendObj', sendObj)
    var resAPI = await fetch('http://api.santavision.net:8500/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendObj)
    })
    let unlockJson = await resAPI.json();
    if (unlockJson.result == true) {
      console.log('cancelgroup', unlockJson);
      //After Getting Unlock Process is Complete, Server will Ask Database to Change Status of Groups Table & Remove the Tuple From Participants Table .
      await groupModel.ChangeStatusDeprecatedArray(Select_Groups_List_On_Duedate);
      await groupModel.RemoveTupleParticipantsArray(Select_Groups_List_On_Duedate);
    }

  } catch (err) {
    console.log(err)
  }
})

module.exports = cron;
