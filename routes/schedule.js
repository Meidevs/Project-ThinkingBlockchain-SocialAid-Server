var cron = require('node-cron');
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
    console.log('resUG', resUG)
    var unlockAPI =  await fetch('http://api.santavision.net/unlock', {
      method : 'POST',
      headers : {
        'Content-Type' : 'application/json',
      },
      body : JSON.stringify(resUG)
    });

    var ujson = await unlockAPI.json();

    if (unlockAPI.ok) {
      console.log('Unlock request Complete : ', ujson.result )
    }

    // Get Participants List From participants Table At Duedate.
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
            partnerCode: 'SOCIALADE'
          }
          if (data.userid == userArray[i].users[j].userid) {
            rawObj.coinWalletAddress = userArray[i].users[j].wallet
            rawObj.amount = parseInt(data.total) * 0.2 + parseInt(data.total) * 0.02;
          } else {
            rawObj.coinWalletAddress = userArray[i].users[j].wallet
            rawObj.amount = parseInt(data.total) * 0.02;
          }
          apiArray.push(rawObj);
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

    var rewAPI = await fetch('http://api.santavision.net/compensation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiArray)
    });

    var json = await rewAPI.json();
    if (rewAPI.ok) {
      console.log('Compensation Success : ', json.result)
      await rewardsModel.InsertRewards(rewardsArray);
    }


  } catch (err) {
    console.log(err)
  }
})

module.exports = cron;