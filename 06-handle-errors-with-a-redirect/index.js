const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const app = express();

let users = [];

// this is a route handler we're using to verify if a user exists, and handle
// the cases where one doesn't exist
const verifyUser = (req, res, next) => {
  const fp = getUserFilePath(req.params.username);

  // fs.exists is deprecated, use fs.access to determine whether the file exists
  // or not
  fs.access(fp, err => {
    if (err) {
      // we can indicate that the resulting callbacks where this callback resides
      // not be called, and rather go on to another route
      // next('route');

      // but instead we can redirect to an error page with something more descriptive
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

// We can define routes which only return json
// This is useful when building APIs
app.get('/data/:username', (req, res) => {
  const user = getUser(req.params.username);

  res.json(user);
});

// this route handler checks to see if there is a json extension, after which we
// can use res.download which the client will download
app.get('*.json', (req, res) => {
  // this will download the file as is
  res.download(`${__dirname}/users/${req.path}`);

  // this will specify a filename for download
  // res.download(`${__dirname}/users/${req.path}`, 'my-filename.ext');
});

// we can monitor all requests to /:username
app.all('/:username', (req, res, next) => {
  // and log the request and params
  console.log(req.method, 'for', req.params.username);
  // passing the request onto the next handler
  next();
});

// app.get takes as many callbacks as we wish
// verifyUser here intercepts the next callback
// It can prevent the request from continuing to the next callback by calling
// next('route')
// or it can have the request passed through by calling next() on its own
app.get('/:username', verifyUser, (req, res) => {
  const user = getUser(req.params.username);

  res.render('user', {
    user,
    address: user.location,
  });
});

// this is where we can indicate that a request for a specific user can't return
// anything
app.get('/error/:username', (req, res) => {
  // we indicate that this is a 404, and we provide some information to render
  // to indicate which user can't be found
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
