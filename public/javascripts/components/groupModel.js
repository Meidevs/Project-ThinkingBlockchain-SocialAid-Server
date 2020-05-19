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
    CreateNewGroups(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var ym = await functions.DateCreator();
                    var rawReturn = await myConnection.query('SELECT groupsid FROM groups');
                    if (rawReturn[0][0] == undefined) {
                        var code = 'G' + ym + '1';
                    } else {
                        var len = rawReturn[0].length - 1;
                        if (parseInt(rawReturn[0][len].groupsid.substring(1, 9)) == ym) {
                            var code = 'G' + ym + (parseInt(rawReturn[0][len].groupsid.substring(9)) + 1);
                        } else {
                            var code = 'G' + ym + '1';
                        }
                    }
                    data.groupsid = code;

                    await myConnection.query('INSERT INTO groups (groupsid, userid, storyid, name, stc, cates, days) VALUES (?, ?, ?, ?, ?, ?, ?)', [data.groupsid, data.userid, data.storyid, data.name, data.stc, data.cates, data.days])

                    var rawReturn_2 = await myConnection.query('SELECT participantsid FROM participants');
                    if (rawReturn_2[0][0] == undefined) {
                        var code_2 = 'P' + ym + '1';
                    } else {
                        var len = rawReturn_2[0].length - 1;
                        if (parseInt(rawReturn_2[0][len].participantsid.substring(1, 9)) == ym) {
                            var code_2 = 'P' + ym + (parseInt(rawReturn_2[0][len].participantsid.substring(9)) + 1);
                        } else {
                            var code_2 = 'P' + ym + '1';
                        }
                    }
                    data.participantsid = code_2;
                    await myConnection.query('INSERT INTO participants (participantsid, userid , groupsid, days) VALUES (?, ?, ?, ?)', [data.participantsid, data.userid, data.groupsid, parseInt(data.days)])

                    console.log(data)
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
                        host : null,
                        story: null,
                        cates: null,
                        name: null,
                        stc: null,
                        days: null,
                    }

                    
                    
                    var resReturn = await myConnection.query('SELECT * FROM groups WHERE status=0');
                    console.log(resReturn[0])
                    for (var i = 0; i < resReturn[0].length; i++) {
                        var result = await myConnection.query('SELECT name FROM members WHERE userid = ?', [resReturn[0][i].userid])
                        rawObj.groupsid = resReturn[0][i].groupsid,
                        rawObj.host = result[0][0].name,
                        rawObj.story = resReturn[0][i].storyid,
                        rawObj.cates = resReturn[0][i].cates,
                        rawObj.name = resReturn[0][i].name,
                        rawObj.stc = resReturn[0][i].stc,
                        rawObj.days = resReturn[0][i].days,
                        rawArray.push(JSON.parse(JSON.stringify(rawObj)))
                    }
                    resolve(rawArray);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    GetAllListOffStatus() {

    }
}

module.exports = new Groups();