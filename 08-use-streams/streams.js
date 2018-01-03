const fs = require('fs');

const input = './users.json';
const output = 'out.json';

// create a stream tha reads data in from a source
const readable = fs.createReadStream(input);

// create a stream to which data can be written to
const writable = fs.createWriteStream(output);

readable.pipe(writable);
