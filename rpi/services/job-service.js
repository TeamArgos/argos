var CronJob = require('cron').CronJob;
var request = require('request');

var JobService = function() {
    this.port = 8080;
    this.baseUrl = "http://localhost"
}

JobService.prototype.discover = function() {
    return new Promise((resolve, reject) => {
        request.post(`${this.baseUrl}:${this.port}/discover`, (err, res, body) => {
            resolve(body);
        });
    })
}

/**
 * Starts a job that runs every minute which instructs the server to
 * discover new devices.
 */
JobService.prototype.runDiscoverJob = function() {
    this.discover(); // Needs to run immediately
    new CronJob('0 * * * * *', () => {
        this.discover();
    }, null, true, 'America/Los_Angeles');
}

JobService.prototype.runSetStateJob = function() {
    new CronJob('*/5 * * * * *', function() {
    }, null, true, 'America/Los_Angeles');
}


module.exports = JobService;
