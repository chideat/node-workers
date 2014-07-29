/**
 * multi process enabled for this
 */

var fs = require('fs');
var cpus = require('os').cpus();
var events = require('events');
var child_process = require('child_process');
var util = require('util');
var utils = require('./utils');
var log4js = require('log4js');

function Workers(options) {
    if (false === (this instanceof Workers)) {
        return new Workers(options);
    }
    this.options = {
        count: cpus.length,
        args: [],
        targets: null,
        logger: 'default',
        appenders: []
    };
    utils.extend(this.options, options);
    this.target = this.options.target;
    if (!this.target || !fs.existsSync(this.target)) { throw new Error('NOT a VALID target file'); }
    if (this.options.appenders) { log4js.configure({ appenders: this.options.appenders }); }
    this.count = this.options.count;
    this.args = this.options.args;
    this.queue = []; // store pid
    this.map = {};   // store work instance
    this.currentIndex = 0;
    this._logger = log4js.getLogger(this.options.logger);
    events.EventEmitter.call(this);

    this._init();
}
util.inherits(Workers, events.EventEmitter);

/**
 * @private
 * init
 */
Workers.prototype._init = function() {
    for (var i = 0;i < this.count; i++) {
        this._create(i);
    }
};

/**
 * @private
 * create one child process entity
 */
Workers.prototype._create = function(i) {
    var worker = child_process.fork(this.target, this.args);
    worker.on('exit', function(/* code */) {
        delete this.map[worker.pid];
        this.emit('uncaughtException', new Error(worker.pid));
        this._create(i);
    }.bind(this)).on('message', function(data) {
        if (false === (data instanceof Array) || data.length === 0 || 'string' !== typeof(data[0])) { return ; }
        switch(data[0]) {
            case 'logger':
                this.logger(data[1], data.slice(2));
                break;
            default:
                // pass;
                break;
        }
    }.bind(this));
    this.map[worker.pid] = worker;
    this.queue[i] = worker.pid;
};

/**
 * @public
 * send message to subprocess
 */
Workers.prototype.send = function() {
    var worker = null;
    while(true) {
        worker = this.map[this.queue[this.currentIndex ++]];
        this.currentIndex = this.currentIndex % this.count;
        if (!worker.connected) {
            worker.kill('SIGTERM');
        }
        else {
            break;
        }
    }
    try { worker.send.apply(worker, Array.prototype.slice.call(arguments, 0)); }
    catch(e) { this.emit('error', e); }
};

/**
 * @public
 * broadcast
 */
Workers.prototype.broadcast = function() {
    var worker = null;
    for (var i = 0;i < this.queue.length; i ++) {
        try {
            worker = this.map[this.queue[i]];
            if (worker.connected) {
                worker.send.apply(worker, Array.prototype.slice.call(arguments, 0));
            }
        }
        catch(e) { this.emit('error', e); }
    }
};

/**
 * @public
 * logger
 */
Workers.prototype.logger = function(level, data) {
    try {
        if (false === (data instanceof Object)) {
            data = [data];
        }
        else if (true !== (data instanceof Array)) {
            data = [JSON.stringify(data)];
        }
        this._logger[level](data.join(' '));
    }
    catch(e) {
        this.emit('error', e);
    }
};

/**
 * @public
 * close all process
 */
Workers.prototype.exit = function() {
    for (var i = 0; i < this.queue.length; i ++) {
        try {
            if (this.queue[i]) {
                var worker = this.map[this.queue[i]];
                worker.kill('SIGTERM');
                delete this.map[this.queue[i]];
                this.queue[i] = null;
            }
        }
        catch(e) {
            this.emit('error', e);
        }
    }
};

module.exports = Workers;
