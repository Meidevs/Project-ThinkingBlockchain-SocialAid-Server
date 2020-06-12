// var myConnection = require('../../../dbConfig.js');
var myConnection = require('../../../mdbConfig.js');
var functions = require('../functions/functions.js');
var userModel = require('../components/authModel.js');

class Groups {
    SelectAll() {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var sql = 'SELECT * FROM ts_groups';
                    var rawReturn = await myConnection.query(sql);
                    resolve(rawReturn);
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }

    GetAllStatusOn() {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawReturn = await myConnection.query('SELECT * FROM ts_groups WHERE status=0');
                    resolve(rawReturn);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    GetAllStatusOff() {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawReturn = await myConnection.query('SELECT * FROM ts_groups WHERE status=1');
                    resolve(rawReturn);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    GetStories(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawReturn = await myConnection.query('SELECT sentence FROM ts_story WHERE storyid = ?', [data]);
                    resolve(rawReturn[0].sentence)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    GetCates(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawReturn = await myConnection.query('SELECT name FROM ts_cates WHERE catesid = ?', [data]);
                    resolve(rawReturn[0].name)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    // You can get All of Information of Group Tuple Only Using Groupsid.
    GetGroupdatas(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawObj = new Object();
                    var rawArray = new Array();

                    rawObj = {
                        groupsid: null,
                        host: null,
                        cates: null,
                        story: null,
                        groupname: null,
                        stc: null,
                        period: null,
                        date: null,
                    }

                    for (var i = 0; i < data.length; i++) {
                        var resReturn = await myConnection.query('SELECT * FROM ts_groups WHERE groupsid = ?', [data[i]]);

                        // Get User's Name Using userid From memebers Table;
                        var name = await userModel.GetName(resReturn[0].userid);

                        // Get Category's Name Using catesid From cates Table;
                        var cates = await this.GetCates(resReturn[0].catesid);

                        // Get Sentence Using storyid From story Table;
                        var story = await this.GetStories(resReturn[0].storyid);

                        rawObj.groupsid = resReturn[0].groupsid;
                        rawObj.host = name;
                        rawObj.cates = cates;
                        rawObj.story = story;
                        rawObj.groupname = resReturn[0].groupname;
                        rawObj.stc = resReturn[0].stc;
                        rawObj.period = resReturn[0].period;
                        rawObj.date = resReturn[0].date;
                        rawObj.status = resReturn[0].status;

                        rawArray.push(JSON.parse(JSON.stringify(rawObj)))
                    }

                    resolve(rawArray);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    ChangeStatusDeprecated(groupsid) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    await myConnection.query('UPDATE ts_groups SET status=999 WHERE groupsid = ?', [groupsid]);
                    resolve(true)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    GetWalletList(groupsid) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();
                    var resReturn = await myConnection.query('SELECT * FROM ts_participants WHERE groupsid = ?', [groupsid]);
                    var groupReturn = await myConnection.query('SELECT stc, period, date FROM ts_groups WHERE groupsid = ?', [groupsid]);
                    var date = new Date(groupReturn[0].date.substring(0, 4), groupReturn[0].date.substring(4, 6), groupReturn[0].date.substring(6, 8) + 15).toISOString().substring(0,10) + ' 23:59:59'
                    var totalSTC = parseInt(groupReturn[0].stc) * parseInt(groupReturn[0].period)
                    for (var i = 0; i < resReturn.length; i++) {
                        var userReturn = await myConnection.query('SELECT coin_wallet_address FROM tb_user_info WHERE user_seq = ?', [resReturn[i].userid]);
                        rawArray.push({ coinWalletAddress: userReturn[0].coin_wallet_address, amount: totalSTC, endDate: date })
                    }
		    var rawObj = new Object();
		    rawObj.list = rawArray;
		    rawObj.partnerCode = "TESTCODE";
	            console.log('rawObj', rawObj);
                    resolve(rawObj)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    RemoveTupleParticipantsList(groupsid) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    await myConnection.query('UPDATE ts_participants SET groupsid = "G999999", userid = "U999999" WHERE groupsid = ?', [groupsid]);
                    resolve(true);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    CreateNewStoried(data) {
        return new Promise(
            async (resolve, reject) => {
                //http://trandent.com/article/Etc/detail/670 코드 생성 참고
                try {
                    var ym = await functions.DateCreator();
                    var returnCount = await myConnection.query('SELECT LPAD(COUNT(*) + 1,6,"0") AS cnt FROM ts_story');
                    var code = 'S' + ym + returnCount[0].cnt;

                    await myConnection.query('INSERT INTO ts_story (storyid, sentence) VALUES (?, ?)', [code, data]);
                    // var storyid = await myConnection.query('SELECT storyid FROM ts_story WHERE stoid=LAST_INSERT_ID()');
                    resolve(code)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    CreateNewGroups(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    // INSERT Group data to Groups Table.
                    var ym = await functions.DateCreator();
                    var returnCount = await myConnection.query('SELECT LPAD(COUNT(*) + 1,6,"0") AS cnt FROM ts_groups');
                    var code = 'G' + ym + returnCount[0].cnt;

                    data.groupsid = code;
                    var date = await functions.DateCreator();
                    await myConnection.query('INSERT INTO ts_groups (userid, groupsid, storyid, catesid, groupname, stc, period, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [data.userid, data.groupsid, data.storyid, data.catesid, data.name, data.stc, data.period, date])

                    // INSERT dataSet to Participants Table.

                    var returnCount_2 = await myConnection.query('SELECT LPAD(COUNT(*) + 1,6,"0") AS cnt FROM ts_participants');
                    var code_2 = 'P' + ym + returnCount_2[0].cnt;

                    data.participantsid = code_2;

                    await myConnection.query('INSERT INTO ts_participants (participantsid, userid , groupsid) VALUES (?, ?, ?)', [data.participantsid, data.userid, data.groupsid])

                    resolve(data)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    GetAllListOnStatus() {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawObj = new Object();
                    var rawArray = new Array();

                    rawObj = {
                        groupsid: null,
                        host: null,
                        cates: null,
                        story: null,
                        groupname: null,
                        stc: null,
                        period: null,
                    }

                    var resReturn = await this.GetAllStatusOn();
                    for (var i = 0; i < resReturn.length; i++) {
                        var resultStory = await this.GetStories(resReturn[i].storyid)
                        var resultName = await userModel.GetName(resReturn[i].userid);
                        rawObj.groupsid = resReturn[i].groupsid,
                            rawObj.groupname = resReturn[i].groupname,
                            rawObj.host = resultName,
                            rawObj.cates = resReturn[i].catesid,
                            rawObj.story = resultStory,
                            rawObj.stc = resReturn[i].stc,
                            rawObj.period = resReturn[i].period,

                            rawArray.push(JSON.parse(JSON.stringify(rawObj)))
                    }

                    resolve(rawArray);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    GetParticipantsList(group, user) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var dataSet = new Object();
                    dataSet = {
                        flags: 0,
                        participantsid: null,
                        groupsid: null,
                        userid: null,
                    }
                    var resReturn = await myConnection.query('SELECT * FROM ts_participants WHERE userid = ? AND groupsid = ?', [user, group]);
                    if (resReturn[0]) {
                        dataSet = {
                            flags: 1,
                            participantsid: resReturn[0].participantsid,
                            groupsid: resReturn[0].groupsid,
                            userid: resReturn[0].userid,
                        }
                    }
                    resolve(dataSet)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    ParticipantInGroup(groupsid, userid, totalParticipants) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    // var dateData = await functions.RateDateMaker(totalParticipants);
                    var ym = await functions.DateCreator();
                    var resReturn = await myConnection.query('SELECT LPAD(COUNT(*) + 1,6,"0") AS cnt FROM ts_participants');
                    var code = 'P' + ym + resReturn[0].cnt;
                    await myConnection.query('INSERT INTO ts_participants (participantsid, userid , groupsid) VALUES (?, ?, ?)', [code, userid, groupsid]);
                    var resCount = await myConnection.query('SELECT COUNT(*) AS cnt FROM ts_participants WHERE groupsid = ?', [groupsid]);
                    resolve(resCount[0].cnt)
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }

    GroupsRun(groupsid, totalParticipants) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var dateData = await functions.RateDateMaker(totalParticipants);

                    await myConnection.query('UPDATE ts_groups SET status=1 WHERE groupsid = ?', [groupsid])
                    var partList = await myConnection.query('SELECT participantsid FROM ts_participants WHERE groupsid = ?', [groupsid]);
                    for (var i = 0; i < totalParticipants; i++) {
                        await myConnection.query('UPDATE ts_participants SET ratedate = ?, duedate = ? WHERE participantsid = ? AND groupsid = ?', [dateData.dateArray[i], dateData.dueDate, partList[i].participantsid, groupsid])
                    }
                    resolve(true)
                } catch (err) {
                    reject(err);
                }
            }
        )
    }
    CancelJoin(groupsid, userid) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    await myConnection.query('UPDATE ts_participants SET groupsid = "G000000", userid="U000000" WHERE groupsid = ? AND userid = ?', [groupsid, userid]);
                    resolve(0)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    GetAllJoinedList(userid) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var resReturn = await myConnection.query('SELECT * FROM ts_participants WHERE userid = ?', [userid]);
                    resolve(resReturn)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    GetParticipantsListOfDate(date) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var resReturn = await myConnection.query('SELECT * FROM ts_participants WHERE duedate = ?', [date]);
                    resolve(resReturn)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    GetParticipantsUserGroups(date) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();
                    var resReturn = await myConnection.query('SELECT userid, groupsid FROM ts_participants WHERE ratedate = ?', [date]);
                    for (var i = 0; i < resReturn.length; i++) {
                        var rawObj = new Object();
                        var insA = await myConnection.query('SELECT coin_wallet_address FROM tb_user_info WHERE user_seq = ?', [resReturn[i].userid]);
                        var insB = await myConnection.query('SELECT stc, period, userid FROM ts_groups WHERE groupsid = ?', [resReturn[i].groupsid]);
                        rawObj.coinWalletAddress = insA[0].coin_wallet_address;
                        rawObj.amount = (parseInt(insB[0].stc) * parseInt(insB[0].period));
                        rawObj.endDate = date.substring(0,4) + '-' + date.substring(4,6) + '-' + date.substring(6,8) + ' 23:59:59';
                        rawArray.push(rawObj);
                    }
			var resObj = new Object();
			resObj.list = rawArray;
			resObj.partnerCode = "TESTCODE";
                    console.log('GetParticipantsUserGroups', resObj)
                    resolve(resObj)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    GetHostGroupList(list) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();
                    for (var i = 0; i < list.length; i++) {
                        var resReturn = await myConnection.query('SELECT userid FROM ts_groups WHERE groupsid = ?', [list[i].groupsid]);
                        if (resReturn[0] && resReturn[0].userid == list[i].userid) {
                            rawArray.push(list[i].groupsid)
                        }
                    }
                    resolve(rawArray);
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }
    GetParticipantsCount(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var resReturn = await myConnection.query('SELECT COUNT(*) AS cnt FROM ts_participants WHERE groupsid = ?', [data[0]]);
                    resolve(resReturn[0].cnt);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    GetDueDate(groupsid) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var resReturn = await myConnection.query('SELECT duedate FROM ts_participants WHERE groupsid=?', [groupsid]);
                    console.log(resReturn)
                    resolve(resReturn[0].duedate)
                } catch (err) {

                }
            }
        )
    }

    GetHostUserList(list) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();
                    for (var i = 0; i < list.length; i++) {
                        var rawObj = new Object();
                        var groupsReturn = await myConnection.query('SELECT userid, stc, period FROM ts_groups WHERE groupsid =?', [list[i]]);
                        var total = parseInt(groupsReturn[0].stc) * parseInt(groupsReturn[0].period);
                        rawObj.groupsid = list[i];
                        rawObj.userid = groupsReturn[0].userid;
                        rawObj.total = total;
                        rawArray.push(rawObj);
                    }
                    resolve(rawArray)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    GetUserList(list) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();

                    for (var i = 0; i < list.length; i++) {
                        var rawObj = new Object();
                        var resUsers = await myConnection.query('SELECT user_seq, coin_wallet_address FROM tb_user_info WHERE user_seq IN (SELECT userid FROM ts_participants WHERE groupsid = ?)', [list[i]]);
                        console.log('resUsers', resUsers)
                        rawObj.groupsid = list[i];
                        rawObj.users = resUsers;
                        rawArray.push(rawObj)
                    }
                    resolve(rawArray)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
}

module.exports = new Groups();
