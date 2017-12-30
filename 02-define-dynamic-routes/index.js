const express = require('express');
const fs = require('fs');
const _ = require('lodash');
const app = express();

let users = [];

fs.readFile('users.json', {encoding: 'utf8'}, (err, data) => {
  if (err) throw err;

  users = JSON.parse(data).map(user => {
    user.name.full = _.startCase(`${user.name.first} ${user.name.last}`);

    return user;
  });
});

app.get('/', (req, res) => {
  const data = users
    .map(
      user =>
        `<a href=${user.username}>${user.name.full} - ${user.username}</a>`
    )
    .join('<br />');

  res.send(data);
});

// this is a middleware - it forwards the request on to the next handler
app.get(/big.*/, (req, res, next) => {
  console.log('BIG USER ACCESS');
  // let other route handlers continute processing this request
  next();
});

app.get('/:username', (req, res) => {
  const user = users.find(user => user.username === req.params.username);

  // nothing else happens after res.send is called.
  // any middleware or handlers defined after this are not going to be fired,
  // so middleware needs to be defined before here
  res.send(JSON.stringify(user));
});

const server = app.listen(8080, () => {
  console.log(`app running at ${server.address().port}`);
});
