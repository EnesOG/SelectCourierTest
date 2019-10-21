const fs = require('fs');
const writeFileAsync = blobs => blobs.forEach((blob,i) => {
   const fileName = `i-${new Date()}`;
   console.log(fileName);
});

const writeFile = () => {
    return new Promise((resolve, reject) => {
        fs.writeFile('./pdf/label.pdf', data, 'binary', (err) => {
            if (err) reject(err);
            else resolve(data);
        })
    })
};


module.exports = {
    writeFileAsync
};