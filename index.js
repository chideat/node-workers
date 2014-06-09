/**
 * multi process enabled for this
 */

var cpus = require('os').cpus(),
    child_process = require('child_process');

function Workers(options) {
    this.count = options.count || 6;
    this.args = options.args || [];
    this.target = options.target;
    if (!this.target) {
        throw new Error('Invalid target file');
    }
    this.queue = []; // store pid
    this.map = {};   // store work instance

    if (this.count > cpus.length) {
        this.count = cpus.length;
    }
    this.currentIndex = 0;
    this.init();
}

/**
 * @private
 * init
 */
Workers.prototype.init = function() {
    for (var i = 0;i <  this.count; i++) {
        this.create(i);
    }
};

/**
 * @private
 * create one child process entity
 */
Workers.prototype.create = function(i) {
    var worker = child_process.fork(this.target, [i].concat(this.args));
    worker.on('exit', function() {
        console.log('[' + Date.now() + ']  Worker ' + worker.pid + ' exit.');
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
        console.log('send error: ', e);
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
            console.log('exit error: ', e);
        }
    }
};

module.exports = Workers;
