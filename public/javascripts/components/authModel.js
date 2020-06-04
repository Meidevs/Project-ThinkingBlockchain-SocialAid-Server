// var myConnection = require('../../../dbConfig.js');
var myConnection = require('../../../mdbConfig.js');
var functions = require('../functions/functions.js');

class User {
    GetWallet () {
        return new Promise (
            async (resolve, reject) => {
                try {
                    var resReturn = await myConnection.query('SELECT wallet FROM members WHERE userid =?', [data]);
                    resolve(resReturn[0].wallet)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    GetMembersCode(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawReturn = await myConnection.query('SELECT userid FROM members WHERE name = ?', [data]);
                    resolve(rawReturn.userid)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    
    GetName(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawReturn = await myConnection.query('SELECT name FROM members WHERE userid = ?', [data]);
                    resolve(rawReturn[0].name)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    
    SelectAll() {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var sql = 'SELECT * FROM members';
                    var rawReturn = await myConnection.query(sql);
                    resolve(rawReturn);
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }

    Register(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawObj = new Object();
                    rawObj = {
                        userid: null,
                        email: data.email,
                        phonenumber: data.phonenumber,
                        name: data.name,
                        password: data.password,
                        pin: data.pin,
                        wallet: data.wallet,
                    }

                    var flags = 0;
                    var allUsers = await this.SelectAll();
                    for (const content of allUsers) {
                        if (content.email == data.email) {
                            flags = 1;
                            break;
                        }
                    }

                    switch (flags) {
                        case 0:
                            // Create Date Based Number to Make userid
                            var ym = await functions.DateCreator();
                            var returnCount = await myConnection.query('SELECT LPAD(COUNT(*) + 1,3,"0") AS cnt FROM members');
                            var code = 'U' + ym + returnCount[0].cnt;

                            rawObj.userid = code;

                            var sql = 'INSERT INTO members (userid, email, phone, name, password, pin, wallet) VALUES (?, ?, ?, ?, ?, ?, ?)';
                            await myConnection.query(sql, [rawObj.userid, rawObj.email, rawObj.phonenumber, rawObj.name, rawObj.password, rawObj.pin, rawObj.wallet])

                            var resObj = {
                                flags: flags,
                                dataSet: rawObj
                            }
                            resolve(resObj)

                        case 1:
                            var resObj = {
                                flags: flags,
                                dataSet: null,
                            }
                            resolve(resObj)
                    }
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }

    Login(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    // Check Non-Exist User, Password Mismatch, Login Complete.
                    var flags;
                    var resObj = new Object();

                    var rawReturn = await myConnection.query('SELECT * FROM members WHERE email = ?', [data.email]);
                    if (rawReturn[0]) {
                        rawReturn = await myConnection.query('SELECT * FROM members WHERE email = ? AND password = ?', [data.email, data.password])
                        if (rawReturn[0]) {
                            resObj = {
                                flag: 0,
                                dataSet: rawReturn[0]
                            }
                        } else {
                            resObj = {
                                flag: 2,
                                dataSet: null,
                            }
                        }
                    } else {
                        resObj = {
                            flag: 1,
                            dataSet: null,
                        }
                    }
                    resolve(resObj);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

}

module.exports = new User;