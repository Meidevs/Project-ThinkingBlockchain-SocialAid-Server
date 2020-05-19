
class Functions {
    EleminateMarks(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    // Function Call,
                    // "str" is transfered Vaiable, "regExp" is Sort of Marks
                    // Check wheter there are marks or not using test Function. And Replace marks to "".
                    var str = data;
                    var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"\s+]/gi;
                    if (regExp.test(str)) {
                        var reStr = str.replace(regExp, "");
                        // var reStr = result.replace(/\s+/g, '');
                    } else {
                        var reStr = str;
                    }
                    resolve(reStr)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    DateCreator () {
        return new Promise (
            async (resolve, reject) => {
                try {
                    var date = new Date();
                    var a = date.getMonth() + 1;
                    var b = date.getDate();
                    if (JSON.stringify(a).length != 2) {
                        var monthCode = '0' + a;
                    } else {
                        var monthCode = JSON.stringify(a)
                    }
                    if (JSON.stringify(b).length !=2) {
                        var dayCode = '0' + b;
                    } else {
                        var dayCode = JSON.stringify(b)
                    }
                    var yearCode = JSON.stringify(date.getFullYear());
                    var returnData = yearCode + monthCode + dayCode;
                    resolve(returnData)
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }
}


module.exports = new Functions();