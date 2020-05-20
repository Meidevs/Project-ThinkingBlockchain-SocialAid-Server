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

                    var sql = 'INSERT INTO groups (groupsid, userid, storyid, name, stc, cates, days) VALUES (?, ?, ?, ?, ?, ?, ?)';
                    await myConnection.query(sql, [data.groupsid, data.userid, data.storyid, data.name, data.stc, data.cates, data.days])

                    var resObj = {
                        flags: flags,
                        dataSet: data
                    }
                    resolve(resObj)
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }

}

module.exports = new Groups();