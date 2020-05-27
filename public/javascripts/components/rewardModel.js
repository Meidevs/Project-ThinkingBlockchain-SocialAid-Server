var myConnection = require('../../../dbConfig.js');
var functions = require('../functions/functions.js');
var userModel = require('../components/authModel.js');
var groupModel = require('../components/groupModel.js');

class Rewards {
    GetAllSTC(list) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();
                    for (var i = 0; i < list.length; i++) {
                        var stc = await myConnection.query('SELECT stc FROM groups WHERE groupsid = ?', [list[i]]);
                        rawArray.push(stc[0][0].stc);
                    }
                    resolve(rawArray);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    GetAllRevenue(list, userid) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();
                    for (var i = 0; i < list.length; i++) {
                        var revenue = 2;
                        var resReturn = await myConnection.query('SELECT period, userid FROM groups WHERE groupsid = ?', [list[i]]);
                        if (resReturn[0][0].userid == userid) {
                            revenue = revenue + 20;

                        }
                        rawArray.push(revenue);
                    }
                    resolve(rawArray)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
}

module.exports = new Rewards();

