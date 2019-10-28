const fs = require('fs');
const {getPrinters} = require('./printFunction');
let files = [];

const writeFile = (blobs) => {
    return new Promise((resolve, reject) => {
        blobs.forEach((blob, i) => {
            let base = blob.replace(/^data:image\/png;base64,/, "");
            const date = new Date().getTime();
            let fileName = `${date}-${i}-${i * 11}`.replace(/ /g, '');
            let file = `${fileName}.pdf`;
            files.push(file);
            fs.writeFile(`./pdf/${file}`, base, 'base64', (err) => {
                reject(err);
            })
        });
        resolve();
    })
};


const writeFileAsync = (blobs, printer) => {
    console.log(blobs);
    writeFile(blobs)
        .then(() => getPrinters(printer, files))
        .catch(e => console.log(e))
};


module.exports = {
    writeFileAsync
};