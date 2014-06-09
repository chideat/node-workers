
setTimeout(function() {
    console.log(process.argv);
}, 1000);

process.on('message', function(data) {
    console.log(data);
}).on('SIGTERM', function() {
    process.exit(0);
});
