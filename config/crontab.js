const CronJob = require('cron').CronJob;
const timezone = 'Europe/Athens';

// Every minute
try{
    (new CronJob('*/5 * * * * *', PostController.viewCalculation, null, true, timezone)).start();
} catch (e){
    console.log(e);
}
