var CronJob = require('cron').CronJob;
var request = require('request');

var JobService = function() {
    this.port = 8000;
    this.baseUrl = "http://localhost"
}

JobService.prototype.discover = function() {
    return new Promise((resolve, reject) => {
        request.post(`${this.baseUrl}:${this.port}/discover`, (err, res, body) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(body);
            }
        });
    })
}

/**
 * Starts a job that runs every minute which instructs the server to
 * discover new devices.
 */
JobService.prototype.runDiscoverJob = function() {
    var that = this;
    this.discover(true); // Needs to run immediately

    // new CronJob('1 * * * * *', () => {
    //     this.discover();
    // }, null, true, 'America/Los_Angeles');

    // Checks every five seconds
    setInterval(function() {
        that.discover(true).catch(err => {/*do nothing*/});
    }, 5000);
}

JobService.prototype.runSetStateJob = function() {
    new CronJob('*/5 * * * * *', function() {
    }, null, true, 'America/Los_Angeles');
}


module.exports = JobService;
