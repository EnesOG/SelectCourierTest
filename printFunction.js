const NodePdfPrinter = require('node-pdf-printer');
const path = require('path');
const fs = require('fs');
__dirname = path.resolve();

const getPrinters = (printer, printerFiles) => {
    const filesPath = printerFiles.map(files => `${__dirname}./pdf/${files}`);
    NodePdfPrinter.printFiles(filesPath, printer)
        .then(() => deleteFile(printerFiles))
        .catch(() => deleteFile(printerFiles));
};

const deleteFile = (files) => files.forEach(file => {
    const path = `./pdf/${file}`;
    setTimeout(() => {
        try {
            fs.unlinkSync(path);
        } catch (err) {
            console.log(err)
        }
    }, 60001);
});

module.exports = {
    getPrinters
};