var cron = require('node-cron');

cron.schedule("* * * * *", function() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
  
    console.log(year + '-' + month + '-' + day)
  })

  module.exports = cron;