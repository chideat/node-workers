
var logger = require('../')('logger');

setInterval(function() {
    logger.info('hello');
    process.send(['data', 'i need to be inited']);
}, 1000);

process.on('message', function(data) {
    console.log('worker', data);
}).on('SIGTERM', function() {
    process.exit(0);
});
