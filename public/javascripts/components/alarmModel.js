var myConnection = require('../../../dbConfig.js');
var functions = require('../functions/functions.js');
var userModel = require('../components/authModel.js');
var groupModel = require('../components/groupModel.js');

class Alarm {
    SetAlarm() {
        return new Promise (
            async (resolve, reject) => {
                try {
                    await myConnection.query('INSERT INTO alarm (alarmid, userid, catesid, catesid, hostid, stc, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [])
                } catch (err) {

                }
            }
        )
    }
}

module.exports = new Alarm();

