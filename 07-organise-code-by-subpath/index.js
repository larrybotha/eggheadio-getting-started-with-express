const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const app = express();

let users = [];

const verifyUser = (req, res, next) => {
  const fp = getUserFilePath(req.params.username);

  fs.access(fp, err => {
    if (err) {
      res.redirect(`/error/${req.params.username}`);
    } else {
      next();
    }
  });
};

const getUserFilePath = username =>
  `${path.join(__dirname, 'users', username)}.json`;

const getUser = username => {
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

  fs.unlinkSync(fp);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), {encoding: 'utf8'});
};

const deleteUser = username => {
  const fp = getUserFilePath(username);

  fs.unlinkSync(fp);
};

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

app.get('/data/:username', (req, res) => {
  const user = getUser(req.params.username);

  res.json(user);
});

app.get('*.json', (req, res) => {
  res.download(`${__dirname}/users/${req.path}`);
});

app.all('/:username', (req, res, next) => {
  console.log(req.method, 'for', req.params.username);
  next();
});

app.get('/:username', verifyUser, (req, res) => {
  const user = getUser(req.params.username);

  res.render('user', {
    user,
    address: user.location,
  });
});

app.get('/error/:username', (req, res) => {
  res.status(404).send(`user with username: ${req.params.username} not found`);
});

app.put('/:username', (req, res) => {
  const {username} = req.params;
  const user = getUser(username);

  user.location = req.body;

  saveUser(username, user);
  res.end();
});

app.delete('/:username', (req, res) => {
  deleteUser(req.params.username);
  res.sendStatus(200);
});

const server = app.listen(8080, () => {
  console.log(`app running at ${server.address().port}`);
});
