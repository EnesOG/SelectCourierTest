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
    app.get('/', (req, res) => res.send('Server works :D'));
    let defaultPort = 5000;
    if (port) defaultPort = port;
    app.post('/sendFile', (req, res) => {
        let fileName;
        const setFileName = (file) => {
            fileName = file.split('.').join('-' + Date.now() + '.').replace(/ /g, '');
        };
        new formidable.IncomingForm().parse(req)
            .on('fileBegin', (name, file) => {
                setFileName(file.name);
                file.path = __dirname + '/pdf/' + fileName
                getPrinters(printer,fileName);
            })
            // For React .on('file', function (name, file) {
            //     io.emit('filePrinter', fileName);
            // });
    });
    server.listen(defaultPort, () => {
        console.log(`server is running on port:${defaultPort}`)
    });
};

module.exports = {
    setPrinter,
    startServer
};
