const CronJob = require('cron').CronJob;
const timezone = 'Europe/Athens';

// Every minute
(new CronJob('*/5 * * * * *', PostController.viewCalculation, null, true, timezone)).start();
