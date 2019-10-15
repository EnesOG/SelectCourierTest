const NodePdfPrinter = require('node-pdf-printer');
const path = require('path');
const fs = require('fs');
__dirname = path.resolve();

const getPrinters = (printer, printerFile) =>{
    NodePdfPrinter.printFiles([__dirname + './pdf/' + printerFile], printer);
    setTimeout(() => {
        deleteFile(printerFile)
    },3000)
};


const deleteFile = (fileName) =>{
    const path = `./pdf/${fileName}`;
    try {
        fs.unlinkSync(path);
    } catch(err) {
        console.log.error(err)
    }
};

module.exports = {
    getPrinters
};