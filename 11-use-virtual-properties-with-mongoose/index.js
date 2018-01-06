const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const app = express();

const JSONStream = require('JSONStream');
const userRouter = require('./username');

const User = require('./db');

let users = [];

app.engine('pug', cons.pug);

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

app.use('/profilepics', express.static(`${__dirname}/images`));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/favicon.ico', (req, res) => res.end());
app.get('/robots.txt', (req, res) => res.end());

app.get('/', (req, res) => {
  User.find({}, (err, users) => res.render('index', {users}));
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
