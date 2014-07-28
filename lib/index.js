/**
 * multi process enabled for this
 */

var cpus = require('os').cpus();
var events = require('events');
var util = require('util');
var child_process = require('child_process');

function Workers(options) {
    if (false === (this instanceof Workers)) {
        return new Workers(options);
    }
    this.count = options.count || 8;
    this.args = options.args || [];
    this.target = options.target;
    if (!this.target) {
        throw new Error('Invalid target file');
    }
    this.queue = []; // store pid
    this.map = {};   // store work instance

    events.EventEmitter.call(this);

    if (this.count > cpus.length) {
        this.count = cpus.length;
    }
    this.currentIndex = 0;
    this._init();
}
util.inherits(Workers, events.EventEmitter);

/**
 * @private
 * init
 */
Workers.prototype._init = function() {
    for (var i = 0;i < this.count; i++) {
        this.create(i);
    }
};

/**
 * @private
 * create one child process entity
 */
Workers.prototype.create = function(i) {
    var worker = child_process.fork(this.target, [i].concat(this.args));
    worker.on('exit', function(code) {
        this.emit('uncaughtException', new Error(worker.pid));
        delete this.map[worker.pid];
        this.create(i);
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
    try {
        worker.send.apply(worker, Array.prototype.slice.call(arguments, 0));
    }
    catch(e) {
        this.emit('error', e);
    }
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
        catch(e) {
            this.emit('error', e);
        }
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
