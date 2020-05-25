var myConnection = require('../../../dbConfig.js');
var functions = require('../functions/functions.js');

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

    GetAllStatusOn () {
        return new Promise (
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
    
    GetAllStatusOff () {
        return new Promise (
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

                    await myConnection.query('INSERT INTO participants (participantsid, userid , groupsid, count) VALUES (?, ?, ?, 1)', [data.participantsid, data.userid, data.groupsid])

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
                        cates : null,
                        story: null,
                        groupname: null,
                        stc: null,
                        period: null,
                    }
                    
                    var resReturn = await this.GetAllStatusOn();
                    console.log(resReturn[0])
                    for (var i = 0; i < resReturn[0].length; i++) {
                        var resultStory = await myConnection.query('SELECT sentence FROM story WHERE storyid = ?', [resReturn[0][i].storyid])
                        var resultName = await myConnection.query('SELECT name FROM members WHERE userid = ?', [resReturn[0][i].userid])

                        rawObj.groupsid = resReturn[0][i].groupsid,
                        rawObj.groupname = resReturn[0][i].groupname,
                        rawObj.host = resultName[0][0].name,
                        rawObj.cates = resReturn[0][i].catesid,
                        rawObj.story = resultStory[0][0].sentence,
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

}

module.exports = new Groups();