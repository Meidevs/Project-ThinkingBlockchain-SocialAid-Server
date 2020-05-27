var myConnection = require('../../../dbConfig.js');
var functions = require('../functions/functions.js');
var userModel = require('../components/authModel.js');

class Groups {
    SelectAll() {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var sql = 'SELECT * FROM groups';
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
                    var rawReturn = await myConnection.query('SELECT * FROM groups WHERE status=0');
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
                    var rawReturn = await myConnection.query('SELECT * FROM groups WHERE status=1');
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
                    var rawReturn = await myConnection.query('SELECT sentence FROM story WHERE storyid = ?', [data]);
                    resolve(rawReturn[0][0].sentence)
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
                    var rawReturn = await myConnection.query('SELECT name FROM cates WHERE catesid = ?', [data]);
                    resolve(rawReturn[0][0].name)
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
                    }
                    for (var i = 0; i < data.length; i++) {
                        var resReturn = await myConnection.query('SELECT * FROM groups WHERE groupsid = ?', [data]);

                        // Get User's Name Using userid From memebers Table;
                        var name = await userModel.GetName(resReturn[0][0].userid);

                        // Get Category's Name Using catesid From cates Table;
                        var cates = await this.GetCates(resReturn[0][0].catesid);

                        // Get Sentence Using storyid From story Table;
                        var story = await this.GetStories(resReturn[0][0].storyid);

                        rawObj.groupsid = resReturn[0][0].groupsid;
                        rawObj.host = name;
                        rawObj.cates = cates;
                        rawObj.story = story;
                        rawObj.groupname = resReturn[0][0].groupname;
                        rawObj.stc = resReturn[0][0].stc;
                        rawObj.period = resReturn[0][0].period;

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
                    console.log(groupsid)
                    await myConnection.query('UPDATE groups SET status=999 WHERE groupsid = ?', [groupsid]);
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

                    var resReturn = await myConnection.query('SELECT * FROM participants WHERE groupsid = ?', [groupsid]);
                    var userReturn = await myConnection.query('SELECT * FROM members');

                    for (var i = 0; i < resReturn[0].length; i++) {
                        for (var j = 0; j < userReturn[0].length; j++) {
                            if (resReturn[0][i].userid == userReturn[0][j].userid) {
                                rawArray.push({ userid: userReturn[0][j].userid, wallet: userReturn[0][j].wallet })
                            }
                        }
                    }
                    resolve(rawArray)
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
                    await myConnection.query('UPDATE participants SET groupsid = "G999999", userid = "U999999" WHERE groupsid = ?', [groupsid]);
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
                    var returnCount = await myConnection.query('SELECT LPAD(COUNT(*) + 1,4,"0") AS cnt FROM story');
                    var code = 'S' + ym + returnCount[0][0].cnt;

                    await myConnection.query('INSERT INTO story (storyid, sentence) VALUES (?, ?)', [code, data]);
                    var storyid = await myConnection.query('SELECT storyid FROM story WHERE id=LAST_INSERT_ID()');
                    resolve(storyid[0][0].storyid)
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
                    var returnCount = await myConnection.query('SELECT LPAD(COUNT(*) + 1,4,"0") AS cnt FROM groups');
                    var code = 'G' + ym + returnCount[0][0].cnt;

                    data.groupsid = code;
                    var date = await functions.DateCreator();
                    await myConnection.query('INSERT INTO groups (userid, groupsid, storyid, catesid, groupname, stc, period, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [data.userid, data.groupsid, data.storyid, data.catesid, data.name, data.stc, data.period, date])

                    // INSERT dataSet to Participants Table.

                    var returnCount_2 = await myConnection.query('SELECT LPAD(COUNT(*) + 1,4,"0") AS cnt FROM participants');
                    var code_2 = 'P' + ym + returnCount_2[0][0].cnt;

                    data.participantsid = code_2;

                    await myConnection.query('INSERT INTO participants (participantsid, userid , groupsid) VALUES (?, ?, ?)', [data.participantsid, data.userid, data.groupsid])

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
                    for (var i = 0; i < resReturn[0].length; i++) {
                        var resultStory = await this.GetStories(resReturn[0][i].storyid)
                        var resultName = await userModel.GetName(resReturn[0][i].userid);
                        rawObj.groupsid = resReturn[0][i].groupsid,
                            rawObj.groupname = resReturn[0][i].groupname,
                            rawObj.host = resultName,
                            rawObj.cates = resReturn[0][i].catesid,
                            rawObj.story = resultStory,
                            rawObj.stc = resReturn[0][i].stc,
                            rawObj.period = resReturn[0][i].period,

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
                    var resReturn = await myConnection.query('SELECT * FROM participants WHERE userid = ? AND groupsid = ?', [user, group]);
                    if (resReturn[0][0]) {
                        dataSet = {
                            flags: 1,
                            participantsid: resReturn[0][0].participantsid,
                            groupsid: resReturn[0][0].groupsid,
                            userid: resReturn[0][0].userid,
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
                    var dateData = await functions.RateDateMaker(totalParticipants);
                    var ym = await functions.DateCreator();
                    var resReturn = await myConnection.query('SELECT LPAD(COUNT(*) + 1,4,"0") AS cnt FROM participants');
                    var resCount = await myConnection.query('SELECT COUNT(*) + 1 AS cnt FROM participants WHERE groupsid = ?', [groupsid]);
                    console.log( resCount[0][0].cnt)
                    var code = 'P' + ym + resReturn[0][0].cnt;
                    await myConnection.query('INSERT INTO participants (participantsid, userid , groupsid) VALUES (?, ?, ?)', [code, userid, groupsid]);

                    if (totalParticipants == resCount[0][0].cnt) {
                        await myConnection.query('UPDATE groups SET status=1 WHERE groupsid = ?', [groupsid])
                        var partList = await myConnection.query('SELECT participantsid FROM participants WHERE groupsid = ?', [groupsid]);
                        console.log(partList[0])
                        for (var i = 0; i < totalParticipants; i++) {
                            await myConnection.query('UPDATE participants SET ratedate = ?, duedate = ? WHERE participantsid = ? AND groupsid = ?', [dateData.dateArray[i], dateData.dueDate, partList[0][i].participantsid, groupsid])
                        }
                    }
                    resolve(true)
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }
    CancelJoin (groupsid, userid) {
        return new Promise (
            async (resolve, reject) => {
                try {
                    await myConnection.query('UPDATE participants SET groupsid = "G000000", userid="U000000" WHERE groupsid = ? AND userid = ?', [groupsid, userid]);
                    resolve(0)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    GetAllJoinedList (userid) {
        return new Promise (
            async (resolve, reject) => {
                try {
                    var resReturn = await myConnection.query('SELECT * FROM participants WHERE userid = ?', [userid]);
                    resolve(resReturn)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
}

module.exports = new Groups();