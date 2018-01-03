const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const app = express();

// const helpers = require('./helpers');
const JSONStream = require('JSONStream');
const userRouter = require('./username');

let users = [];

app.engine('pug', cons.pug);

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

app.use('/profilepics', express.static(`${__dirname}/images`));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/favicon.ico', (req, res) => res.end());

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
  // this relies on a blocking function - readFileSync.
  // Any requests for a user will block all processing on the server until this
  // is processed - JS is single threaded.
  // const user = helpers.getUser(req.params.username);

  // instead of using syncrhonous functions, we can use streams which are
  // non-blocking.
  const readStream = fs.createReadStream(
    `${__dirname}/users/${req.params.username}.json`
  );

  // now we can't send readstream directly as json, because it's not data, it's a
  // stream.
  // res.json(user);

  // But res in express is a writable stream, so we can pipe our readable stream
  // to it instead:
  readStream.pipe(res);
});

// using JSONStream we can more easily manipulate the data sent to the client
// and create a non-blocking route
app.get('/users/by/:gender', (req, res) => {
  // create a readstream from our users file
  const readStream = fs.createReadStream(`${__dirname}/users.json`);

  readStream
    // pipe the stream to JSONStream.parse
    .pipe(
      JSONStream.parse(
        // specify that we want everything (JSONStream allows for filtering)
        '*',
        // each user comes through as its own object.
        // We can determine what we want returned from that object
        user => (user.gender === req.params.gender ? user.name : null)
      )
    )
    // convert the JSON to a string using a specific format
    .pipe(JSONStream.stringify('[\n ', ',\n ', '\n]\n'))
    // pipe the stirng to res to be displayed for the user
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
