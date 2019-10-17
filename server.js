const {getPrinters} = require('./printFunction');
let printer;

const setPrinter  = (name) => {
    printer = name;
};

const startServer =  (port) => {
    const express = require('express');
    const app = express();
    const {ipcRenderer} = require('electron');
    const server = require('http').Server(app);
    const formidable = require('formidable');
    const compression = require('compression');
    const bodyParser = require('body-parser');
    const cors = require('cors');
    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cors());
    app.get('/ping', (req, res) => res.sendStatus(200));
    let defaultPort = 5000;
    let fallbackPort = 5001;
    if (port) defaultPort = port;
    app.post('/sendFile', (req, res) => {
        let fileName;
        let files = [];
        const setFileName = (file) => {
            fileName = file.split('.').join('-' + Date.now() + '.').replace(/ /g, '');
        };
        new formidable.IncomingForm().parse(req)
            .on('fileBegin', (name, file) => {
                setFileName(file.name);
                files.push(fileName);
                file.path = __dirname + '/pdf/' + fileName;
               // console.log(file.path);
            })
            .on('end', () => {
                getPrinters(printer,files);
            })
            // For React .on('file', function (name, file) {
            //     io.emit('filePrinter', fileName);
            // });
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
