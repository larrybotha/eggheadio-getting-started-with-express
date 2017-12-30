const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('hello world');
});

app.get('/yo', (req, res) => {
  res.send('yo!');
});

const server = app.listen(8080, () => {
  console.log(`app running at ${server.address().port}`);
});
