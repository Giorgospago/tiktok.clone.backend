const CronJob = require('cron').CronJob;
const timezone = 'Europe/Athens';

// Every minute
(new CronJob('* * * * *', PostController.viewCalculation, null, true, timezone)).start();
