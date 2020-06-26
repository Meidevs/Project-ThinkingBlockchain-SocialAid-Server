
var myConnection = require('../../../mdbConfig.js');
var functions = require('../functions/functions.js');
var userModel = require('../components/authModel.js');
var groupModel = require('../components/groupModel.js');

class Alarm {

    SelectAll () {
        return new Promise (
            async (resolve, reject) => {
                try {
                    var rawReturn = await myConnection.query('SELECT userid FROM alarm');
                    resolve(rawReturn);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    SetNewAlarm(userid, cateid, hostid, stc) {
        return new Promise (
            async (resolve, reject) => {
                try {
                    var returnCount = await myConnection.query('SELECT LPAD(COUNT(*) + 1,6,"0") AS cnt FROM alarm');
                    var code = 'S' + returnCount[0][0].cnt;
                    await myConnection.query('INSERT INTO alarm (alarmid, userid, catesid, hostid, stc, status) VALUES (?, ?, ?, ?, ?, 0)', [code, userid, cateid, hostid, stc]);
                    resolve(true)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    UpdateAlarm(userid, cateid, hostid, stc) {
        return new Promise (
            async (resolve, reject) => {
                try {
                    await myConnection.query('UPDATE alarm SET catesid = ?, hostid = ?, stc = ? WHERE userid = ?', [cateid, hostid, stc, userid]);
                    resolve(true);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    ChangeAlarmStatus (catesid, hostid, stc) {
        return new Promise (
            async (resolve, reject) => {
                try {
                    await myConnection.query('UPDATE alarm SET status=1 WHERE catesid = ? AND hostid = ? AND stc = ?', [catesid, hostid, stc]);
                    resolve(true)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
}

module.exports = new Alarm();

