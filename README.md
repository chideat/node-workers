# node-workers

worker process manager.

### Functions
* create/close/auto_restart bunch of processes.
* send/broadcase messages to child processes.
* multiprocess logging support.

### Principles
* use child_process to manage bunch of processes.
* the communication between master and worker is by IPC.
* logging function is also support by IPC.

### LICENSE 
MIT
