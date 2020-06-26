
var myConnection = require('../../../mdbConfig.js');
var functions = require('../functions/functions.js');

class User {
    GetWallet (data) {
        return new Promise (
            async (resolve, reject) => {
                try {
                    var resReturn = await myConnection.query('SELECT coin_wallet_address FROM tb_user_info WHERE user_seq =?', [data]);
                    resolve(resReturn[0].coin_wallet_address)
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
                    var rawReturn = await myConnection.query('SELECT user_seq FROM tb_user_info WHERE name = ?', [data]);
                    resolve(rawReturn[0].user_seq)
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
                    var rawReturn = await myConnection.query('SELECT name FROM tb_user_info WHERE user_seq = ?', [data]);
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
                    var sql = 'SELECT * FROM tb_user_info';
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
                            var returnCount = await myConnection.query('SELECT LPAD(COUNT(*) + 1,3,"0") AS cnt FROM tb_user_info');
                            var code = 'U' + ym + returnCount[0].cnt;

                            rawObj.userid = code;

                            var sql = 'INSERT INTO tb_user_info (userid, email, phone, name, password, pin, wallet) VALUES (?, ?, ?, ?, ?, ?, ?)';
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
                    var rawReturn = await myConnection.query('SELECT * FROM tb_user_info WHERE email = ?', [data.email]);
		    if (rawReturn[0]) {
		       if (rawReturn[0].email == data.email) {
				if (rawReturn[0].passwd == data.password) {
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
