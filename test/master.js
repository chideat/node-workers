/**
 * multi process enabled for this
 */

var cpus = require('os').cpus(),
    Workers = require('../');

var workers = new Workers({
    target: './app.js',
    args: ['development']
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
}, 200);


setTimeout(function() {
    workers.exit();
    process.exit(0);
}, 2000);
