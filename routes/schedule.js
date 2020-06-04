var cron = require('node-cron');
var groupModel = require('../public/javascripts/components/groupModel.js');
var authModel = require('../public/javascripts/components/authModel.js');
var rewardsModel = require('../public/javascripts/components/rewardModel.js');
var functions = require('../public/javascripts/functions/functions.js');

cron.schedule("00 00 * * *", async () => {
  try {
    var returnArray = new Array();
    var listArray = new Array();
    var rewardsArray = new Array();
    var rawObj = new Object();
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dateString = await functions.DateCreator();

    // Get Participants List From participants Table.
    // At Duedate
    var resReturn = await groupModel.GetParticipantsListOfDate(dateString);
    for (var i = 0; i < resReturn.length; i++) {
      var groupsidList = resReturn[i].groupsid;
      listArray.push(groupsidList)
    }
    // Remove Duplicate Users.
    var indexList = listArray.filter((item, index) => listArray.indexOf(item) == index);

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
    // Transfer Wallet List to Santa. 
    // Transfer Wallet Addr to Santa Wallet API
    // 수정 요망
    // await rewardsModel.GetWalletList(rawObj.users);


    await rewardsModel.InsertRewards(rewardsArray);
  } catch (err) {
    console.log(err)
  }
})

module.exports = cron;