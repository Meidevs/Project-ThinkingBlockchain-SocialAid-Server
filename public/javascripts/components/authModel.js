var myConnection = require('../../../dbConfig');

class User {
    Register(data) {
        return new Promise (
            async (resolve, reject) => {
                try {
                    console.log('data : ',data)
                    var cntResult = await myConnection.query('SELECT COUNT(*) as cnt FROM members');
                    console.log('a', cntResult)

                    var sql = 'INSERT INTO members ('
                } catch (err) {

                }
            }
        )
    }
    
}

module.exports = new User;