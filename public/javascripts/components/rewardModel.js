// var myConnection = require('../../../dbConfig.js');
var myConnection = require('../../../mdbConfig.js');
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
                        var resReturn = await myConnection.query('SELECT stc, period FROM groups WHERE groupsid = ?', [list[i]]);
                        rawArray.push(parseInt(resReturn[0].stc) * parseInt(resReturn[0].period));
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
                        if (resReturn[0].userid == userid) {
                            revenue = revenue + 20;
                        }
                        rawArray.push(revenue);
                    }
                    resolve(rawArray)
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }

    InsertRewards(list) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var ymd = await functions.DateCreator();
                    for (var i = 0; i < list.length; i++) {
                        var rawRev = await myConnection.query('SELECT stc, period, userid FROM groups WHERE groupsid = ?', [list[i].groupsid])
                        for (var j = 0; j < list[i].users.length; j++) {
                            if (rawRev[0].userid == list[i].users[j]) {
                                var rev = (rawRev[0].stc * rawRev[0].period) * 0.22;
                            } else {
                                var rev = (rawRev[0].stc * rawRev[0].period) * 0.02;
                            }
                            var resReturn = await myConnection.query('SELECT LPAD(COUNT(*) + 1,7,"0") AS cnt FROM rewards');
                            var code = 'R' + resReturn[0].cnt
                            await myConnection.query('INSERT INTO rewards (rewardsid, groupsid, userid, date, revenue) VALUES (?, ?, ?, ?, ?)', [code, list[i].groupsid, list[i].users[j], ymd, rev])
                        }
                        await myConnection.query('UPDATE groups SET status = 2 WHERE groupsid = ?', [list[i].groupsid]);
                    }

                } catch (err) {
                    console.log(err)
                }
            }
        )
    }
    GetAllProfit(userid) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();
                    var resReturn = await myConnection.query('SELECT revenue FROM rewards WHERE userid = ?', [userid]);

                    for (var i = 0; i < resReturn.length; i++) {
                        rawArray.push(parseInt(resReturn[i].revenue))
                    }
                    resolve(rawArray);
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }
    GetAllRepayment(list) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();
                    for (var i = 0; i < list.length; i++) {
                        var resReturn = await myConnection.query('SELECT stc, period FROM groups WHERE groupsid = ? AND status = 2', [list[i]]);
                        if (resReturn[0]) {
                            rawArray.push(parseInt(resReturn[0].stc) * parseInt(resReturn[0].period));
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
    DateRewards(userid) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var dateMoney = await myConnection.query('SELECT year(date) AS annually, month(date) AS monthly, SUM(revenue) AS total FROM rewards WHERE userid = ? GROUP BY YEAR(date), MONTH(date) ', [userid]);
                    resolve(dateMoney)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    GetWalletList(list) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();
                    for (var i = 0; i < list.length; i++) {
                        var resReturn = await myConnection.query('SELECT wallet, pin FROM members WHERE userid=?', [list[i]]);
                        rawArray.push(resReturn[0])
                    }
                    resolve(rawArray);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
}

module.exports = new Rewards();

