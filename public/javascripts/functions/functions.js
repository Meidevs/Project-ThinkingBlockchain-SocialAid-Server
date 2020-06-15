var crypto = require('crypto');
var btoa = require('btoa');

class Functions {
    PasswordEncryption (id, pw) {
     return new Promise (
      async (resolve, reject) => {
       try {
          var cryptoHash = crypto.createHash('sha256').update(id).update(pw).digest();
          var base64String = await btoa(String.fromCharCode(...new Uint8Array(cryptoHash)));
	  resolve(base64String);
       } catch (err) {
          reject(err) 
       }
      }
     )
    }

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

    DateCreator() {
        return new Promise(
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
                    if (JSON.stringify(b).length != 2) {
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
    RateDateMaker(data) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    // Error ? 발생가능성 높음
                    var dataSet = new Object();
                    var dateArray = new Array();
                    var period = parseInt(data)
                    var date = new Date();
                    var year = date.getFullYear();
                    var month = date.getMonth();
                    var day = date.getDate();
                    var dueDate = new Date(year, month, day + period);
                    for (var i = 1; i <= period; i++) {
                        var daybyday = new Date(year, month, day + i)
                        dateArray.push(daybyday.getFullYear() + '-' + (daybyday.getMonth() + 1) + '-' + daybyday.getDate());
                    }
                    // Shuffle datas in the DateArray.
                    for (let x = dateArray.length - 1; x > 0; x--) {
                        const y = Math.floor(Math.random() * (x + 1));
                        [dateArray[x], dateArray[y]] = [dateArray[y], dateArray[x]];
                    }
                    dataSet = {
                        dueDate: dueDate,
                        dateArray: dateArray,
                    }
                    resolve(dataSet)
                } catch (err) {
                    console.log(err)
                    reject(err)
                }
            }
        )
    }

    SearchBox(data, filter) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var rawArray = new Array();
                    var cnt = 0;

                    for (var key in filter) {
                        if (filter[key] != null) {
                            cnt += 1;
                        }
                    }
                    switch (cnt) {
                        case 3:
                            data.filter(item => {
                                if (item.catesid == filter.catesid && item.userid == filter.userid && item.groupname == filter.groupname) {
                                    rawArray.push(item.groupsid);
                                }
                            });
                            break;
                        case 2:
                            var datas = data.filter(item => {
                                if (item.catesid != filter.catesid && item.userid == filter.userid && item.groupname == filter.groupname) {
                                    rawArray.push(item.groupsid);
                                } else if (item.catesid == filter.catesid && item.userid != filter.userid && item.groupname == filter.groupname) {
                                    rawArray.push(item.groupsid);
                                } else if (item.catesid == filter.catesid && item.userid == filter.userid && item.groupname != filter.groupname) {
                                    rawArray.push(item.groupsid);
                                }
                            });
                            break;
                        case 1:
                            var datas = data.filter(item => {
                                if (item.catesid == filter.catesid) {
                                    rawArray.push(item.groupsid);
                                } else if (item.userid == filter.userid) {
                                    rawArray.push(item.groupsid);
                                } else if (item.groupname == filter.groupname) {
                                    rawArray.push(item.groupsid);
                                }
                            });
                            break;
                        default:
                            break;
                    }
                    resolve(rawArray)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
    YearCalculator(years) {
        return new Promise (
            async (resolve, reject) => {
                try {
                    var yearArray = new Array();
                    for (var i = 0; i < years.length; i++) {
                        var sum = 0;
                        for (var j = 0; j < 12; j++) {
                            sum += years[i].month[j].total;
                        }
                        yearArray.push({year : years[i].year, total : sum})
                    }
                    resolve(yearArray)
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    MonthCalculator(years) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    var now = new Date();
                    var nowMonth = now.getMonth();
                    var monthArray = new Array();
                    var before = nowMonth - 6;
                    var after = nowMonth + 6;
                    if (nowMonth == 6) {
                        for (var i = 0; i < 12; i++) {
                            monthArray.push({month : i, total : years[3].month[i].total});
                        }
                    } else {
                        if (before < 0) {
                            before = (nowMonth - 6) * (-1);

                            for (var i = 12 - before; i < 12; i++ ){
                                monthArray.push({month : i, total : years[2].month[i].total});
                            }
                            for (var i = 0; i < after; i++) {
                                monthArray.push({month : i, total : years[3].month[i].total});
                            }
                        }
                        else if(after > 12) {
                            after = (nowMonth + 6) - 12;

                            for (var i = before; i < 12; i++) {
                                monthArray.push({month : i, total : years[3].month[i].total});
                            }

                            for(var i = 0; i < after; i++) {
                                monthArray.push({month : i, total : years[4].month[i].total});
                            }
                        }    
                    }
                    resolve(monthArray);
                } catch (err) {
                    reject(err)
                }
            }
        )
    }
}


module.exports = new Functions();

