"use strict";

var moduleType = 'logger';

// check if this is sub process(forked by child_process module)
if (false === (process.send instanceof Function)) {
    throw new Error('NOT a subprocess forked by Workers!');
}

module.exports = {
    trace: function() {
        var level = "trace";
        process.send([moduleType, level].concat(Array.prototype.slice.call(arguments, 0)));
    },
    debug: function() {
        var level = "debug";
        process.send([moduleType, level].concat(Array.prototype.slice.call(arguments, 0)));
    },
    info: function() {
        var level = "info";
        process.send([moduleType, level].concat(Array.prototype.slice.call(arguments, 0)));
    },
    warn: function() {
        var level = "warn";
        process.send([moduleType, level].concat(Array.prototype.slice.call(arguments, 0)));
    },
    error: function() {
        var level = "error";
        process.send([moduleType, level].concat(Array.prototype.slice.call(arguments, 0)));
    },
    fatal: function() {
        var level = "fatal";
        process.send([moduleType, level].concat(Array.prototype.slice.call(arguments, 0)));
    }
};
