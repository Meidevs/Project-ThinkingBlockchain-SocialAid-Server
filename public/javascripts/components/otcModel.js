var myConnection = require('../../../mdbConfig.js');

class OTC {
    InsertInto(data) {
        return new Promise (
            async (resolve, reject) => {
                try {
                    await myConnection.query('INSERT INTO ts_list (date, name, phonenumber, address, amount, status) VALUES (?, ?, ?, ?, ?, ?)', [data.date, data.name, data.phonenumber, data.address, data.amount,data.status]);
                    resolve(true)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    GetOTCList () {
        return new Promise (
            async (resolve, reject) => {
                try {
                    var List_Of_Tx = myConnection.query('SELECT * FROM ts_list');
                    console.log(List_Of_Tx)
                    resolve(List_Of_Tx);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

}

module.exports = new OTC();