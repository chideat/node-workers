# node-workers

Worker process manager.

### Functions
* create/close/auto_restart bunch of processes.
* send/broadcast/sendTo messages to child processes.
* multiprocess logging support.

### Usage
 #### Install
```shell
npm install node-workers
```
 #### master
```js
var Workers = require('node-workers')('Workers');
```
 #### worker
```js
var logger = require('node-workers')('logger');
```
 #### worker send message to master
```js
process.send(['data', 'i need to be inited']);
```
[More Examples](/examples)

### Protocols
There are too protocols between master and workers
* logger
Used to do log job. internal use.
* data
Used to communicate with master. Used by worker.

### Principles
* Use child_process to manage bunch of processes.
* The communication between master and worker is by IPC.
* Logging function is also supported by IPC.


### LICENSE
MIT
