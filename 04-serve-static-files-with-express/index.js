const express = require('express');
const fs = require('fs');
const _ = require('lodash');
const cons = require('consolidate');
const app = express();

let users = [];

fs.readFile('users.json', {encoding: 'utf8'}, (err, data) => {
  if (err) throw err;

  users = JSON.parse(data).map(user => {
    user.name.full = _.startCase(`${user.name.first} ${user.name.last}`);

    return user;
  });
});

app.engine('hbs', cons.handlebars);

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

app.use(express.static(`${__dirname}/images`));

// we can set a handle for requests at a specific path. We can have
// images specify that this is their path, and ther request is then
// handled by serving images at /images instead
app.use('/profilepics', express.static(`${__dirname}/images`));

app.get('/', (req, res) => {
  res.render('index', {users});
});

app.get(/big.*/, (req, res, next) => {
  console.log('BIG USER ACCESS');
  next();
});

// render users using user.pug
app.get('/:username', (req, res) => {
  const user = users.find(user => user.username === req.params.username);

  res.render('user', {user});
});

const server = app.listen(8080, () => {
  console.log(`app running at ${server.address().port}`);
});
