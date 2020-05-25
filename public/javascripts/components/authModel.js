var myConnection = require('../../../dbConfig.js');
var functions = require('../functions/functions.js');

class User {
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
                    for (const content of allUsers[0]) {
                        if (content.email == data.email) {
                            flags = 1;
                            break;
                        }
                    }

                    switch (flags) {
                        case 0:
                            // Create Date Based Number to Make userid
                            var ym = await functions.DateCreator();
                            var rawReturn = await myConnection.query('SELECT userid FROM members');
                            if (rawReturn[0][0] == undefined) {
                                var code = 'U' + ym.substring(0, 6) + '1';
                            } else {
                                var len = rawReturn[0].length - 1;
                                if (parseInt(rawReturn[0][len].userid.substring(1, 7)) == ym.substring(0, 6)) {
                                    var code = 'U' + ym.substring(0, 6) + (parseInt(rawReturn[0][len].userid.substring(7, 9)) + 1);
                                } else {
                                    var code = 'U' + ym.substring(0, 6) + '1';
                                }
                            }
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

    Login (data) {
        return new Promise (
            async (resolve, reject) => {
                try {
                    // Check Non-Exist User, Password Mismatch, Login Complete.
                    var flags;
                    var resObj = new Object();

                    var rawReturn = await myConnection.query('SELECT * FROM members WHERE email = ?', [data.email]);
                    if (rawReturn[0][0]) {
                        rawReturn = await myConnection.query('SELECT * FROM members WHERE email = ? AND password = ?', [data.email, data.password] )
                        if (rawReturn[0][0]) {
                            resObj = {
                                flag : 0,
                                dataSet : rawReturn[0]
                            }
                        } else {
                            resObj = {
                                flag : 2,
                                dataSet : null,
                            }
                        }
                    } else {
                        resObj = {
                            flag : 1,
                            dataSet : null,
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