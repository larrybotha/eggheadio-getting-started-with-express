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

// not all templating engines support express.
// consolidate handles that for us.
// We specify the format to evaluate, and the engine to use when that format is
// used.
// In this case, whenever a response is rendered with handlebars, use consolidate
// to handle the rendering
app.engine('hbs', cons.handlebars);

// instead of rendering markup directly via our route handler, we can use
// express' support for templating engines
// [1] configure where express gets templates from
app.set('views', './views');
// [2] set the template engine to pug
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  // the users object is now available in the template as users

  // even though our template engine is set to pug, we can override that by
  // specifying the extension
  // res.render('index.hbs', {users});

  res.render('index', {users});
});

app.get(/big.*/, (req, res, next) => {
  console.log('BIG USER ACCESS');
  next();
});

app.get('/:username', (req, res) => {
  const user = users.find(user => user.username === req.params.username);

  res.send(JSON.stringify(user));
});

const server = app.listen(8080, () => {
  console.log(`app running at ${server.address().port}`);
});
