let printer;
const setPrinter = (name) => {
    printer = name;
};

const startServer = (port, res) => {
    const express = require('express');
    const app = express();
    const {ipcRenderer} = require('electron');
    const server = require('http').Server(app);
    const formidable = require('formidable');
    const {writeFileAsync} = require('./writeFileAsync');
    const compression = require('compression');
    const fs = require('fs');
    const bodyParser = require('body-parser');
    const cors = require('cors');
    app.use(compression());
    app.use(bodyParser.json({limit: '1000mb'}));
    app.use(bodyParser.urlencoded({extended: true, limit: '1000mb'}));
    app.use(cors());
    app.get('/ping', (req, res) => res.sendStatus(200));
    let defaultPort = 5000;
    let fallbackPort = 5001;
    if (port) defaultPort = port;
    app.post('/sendFile', (req, res) => {
        const {files} = req.body;
        writeFileAsync(files, printer);
        res.json({status: 'Printing'});
    });

    app.post('/testFile', (req, res) => {
        res.json(req.body.files)
    });
    server.listen(defaultPort, () => {
        console.log(`server is running on port:${defaultPort}`)
    });

    server.on('error', function (e) {
        server.listen(fallbackPort, () => {
            console.log(`server is running on port:${fallbackPort}`);
        });
    });
};

module.exports = {
    setPrinter,
    startServer
};
