module.exports = io => {
    io.on('connection', function (socket) {
        socket.removeAllListeners();
        console.log('user connected');

        socket.on('disconnect', function(){
            console.log('user disconnected');
            socket.leaveAll();
            socket.removeAllListeners();
        });
    });
};