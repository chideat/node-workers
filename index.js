

module.exports = function(name) {
    if (!name || typeof(name) !== 'string') {
        return undefined;
    }
    switch(name.toLowerCase()) {
        case 'workers':
            return require('./lib');
        case 'logger':
            return require('./lib/logger');
        default:
            return require('./lib');
    }
};
