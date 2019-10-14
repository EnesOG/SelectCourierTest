const NodePdfPrinter = require('node-pdf-printer');
const path = require('path');
__dirname = path.resolve();

const getPrinters = (printer, printerFile) => {
   // NodePdfPrinter.printFiles([__dirname + './pdf/' + printerFile], printer);
    console.log(`Printer is ${printer}`);
    console.log(`File is ${printerFile}`)
};


module.exports = {
    getPrinters
}