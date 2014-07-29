
var logger = require('../')('logger');

setInterval(function() {
    logger.info('hello');
}, 1000);

process.on('message', function(data) {
    console.log(data);
}).on('SIGTERM', function() {
    process.exit(0);
});
