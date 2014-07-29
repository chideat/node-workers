/**
 * multi process enabled for this
 */

var cpus = require('os').cpus();
var Workers = require('../')('Workers');
var log4js = require('log4js');

log4js.configure({
    appenders: [
        {
            type: 'file',
            filename: 'logs/test.log',
            category: 'test'
        }
    ]
});

var workers = new Workers({
    target: './app.js',
    args: ['development'],
    logger: 'test'
});

workers.on('error', function(err) {
    console.log(err);
}).on('uncaughtException', function(err) {
    console.log(err);
});

process.on('message', function(msg) {
    if (msg == 'shutdown') {
        workers.exit();
        process.exit(0);
    }
}).on('SIGTERM', function() {
    workers.exit();
    process.exit(0);
}).on('uncaughtException', function(e) {
    console.log(e);
    workers.exit();
    process.exit(1);
});

setInterval(function() {
    workers.send([1,2,3,4]);
    workers.logger('error', 'hello, master');
}, 500);
