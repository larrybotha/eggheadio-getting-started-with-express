const fs = require('fs');

const input = './users.json';
const output = 'out.json';

const readable = fs.createReadStream(input);

const writable = fs.createWriteStream(output);

readable.pipe(writable);
