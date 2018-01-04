const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const app = express();

const JSONStream = require('JSONStream');
const userRouter = require('./username');

let users = [];

app.engine('pug', cons.pug);

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

app.use('/profilepics', express.static(`${__dirname}/images`));

// No need for bodyParser - it's available with express now
// These are all middlewares
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/favicon.ico', (req, res) => res.end());

// Our handler here is a custom app-level middleware
app.get('/', (req, res) => {
  let users = [];

  fs.readdir('users', (err, files) => {
    if (err) throw err;

    files.map(file => {
      fs.readFile(
        path.join(__dirname, 'users', file),
        {encoding: 'utf8'},
        (e, data) => {
          if (e) throw e;
          const user = JSON.parse(data);

          user.name.full = _.startCase(`${user.name.first} ${user.name.last}`);
          users.push(user);

          if (users.filter(Boolean).length === files.length) {
            res.render('index', {users});
          }
        }
      );
    });
  });
});

app.use('/:username', userRouter);

app.get('/data/:username', (req, res) => {
  const readStream = fs.createReadStream(
    `${__dirname}/users/${req.params.username}.json`
  );
  readStream.pipe(res);
});

app.get('/users/by/:gender', (req, res) => {
  const readStream = fs.createReadStream(`${__dirname}/users.json`);

  readStream
    .pipe(
      JSONStream.parse(
        '*',
        user => (user.gender === req.params.gender ? user.name : null)
      )
    )
    .pipe(JSONStream.stringify('[\n ', ',\n ', '\n]\n'))
    .pipe(res);
});

app.get('*.json', (req, res) => {
  res.download(`${__dirname}/users/${req.path}`);
});

app.get('/error/:username', (req, res) => {
  res.status(404).send(`user with username: ${req.params.username} not found`);
});

const server = app.listen(8080, () => {
  console.log(`app running at ${server.address().port}`);
});
