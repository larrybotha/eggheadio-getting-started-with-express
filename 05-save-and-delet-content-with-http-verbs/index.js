const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const app = express();

let users = [];

// vuild the path for a user's file
const getUserFilePath = username =>
  `${path.join(__dirname, 'users', username)}.json`;

// get a user by username
const getUser = username => {
  // first, parse the response from reading the user's file
  let user = JSON.parse(
    fs.readFileSync(getUserFilePath(username), {encoding: 'utf8'})
  );
  user.name.full = [user.name.first, user.name.last].join(' ');
  _.keys(user.location).forEach(
    key => (user.location[key] = _.startCase(user.location[key]))
  );

  return user;
};

const saveUser = (username, data) => {
  const fp = getUserFilePath(username);

  fs.unlinkSync(fp); // delete the file
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), {encoding: 'utf8'});
};

fs.readFile('users.json', {encoding: 'utf8'}, (err, data) => {
  if (err) throw err;

  users = JSON.parse(data).map(user => {
    user.name.full = _.startCase(`${user.name.first} ${user.name.last}`);

    return user;
  });
});

app.engine('pug', cons.pug);

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

app.use('/profilepics', express.static(`${__dirname}/images`));
app.use(bodyParser.urlencoded({extended: true}));

// handle requests for favicon before they get to any other handlers.
// end the response
// Without this a request for a user ends up going all the way to getUser,
// and the app throws an error in attempting to retrieve favicon.ico.json
app.get('/favicon.ico', (req, res) => res.end());

app.get('/', (req, res) => {
  res.render('index', {users});
});

app.get('/:username', (req, res) => {
  const user = getUser(req.params.username);

  res.render('user', {
    user,
    address: user.location,
  });
});

app.put('/:username', (req, res) => {
  const {username} = req.params;
  const user = getUser(username);

  user.location = req.body;

  saveUser(username, user);
  res.end();
});

const server = app.listen(8080, () => {
  console.log(`app running at ${server.address().port}`);
});
