const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const app = express();

// move helpers to their own file
const helpers = require('./helpers');
// import our username mini-app
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

// user our new userRouter to handle requests to /:username
app.use('/:username', userRouter);

app.get('/data/:username', (req, res) => {
  const user = helpers.getUser(req.params.username);

  res.json(user);
});

app.get('*.json', (req, res) => {
  res.download(`${__dirname}/users/${req.path}`);
});

// instead of having individual instances of app.get app.put etc we can
// chain them by using app.route
// app
//   .route('/:username')
//   .all((req, res, next) => {
//     console.log(req.method, 'for', req.params.username);
//     next();
//   })
//   .get(helpers.verifyUser, (req, res) => {
//     const user = helpers.getUser(req.params.username);

//     res.render('user', {
//       user,
//       address: user.location,
//     });
//   })
//   .put((req, res) => {
//     const {username} = req.params;
//     const user = helpers.getUser(username);

//     user.location = req.body;

//     helpers.saveUser(username, user);
//     res.end();
//   })
//   .delete((req, res) => {
//     helpers.deleteUser(req.params.username);
//     res.sendStatus(200);
//   });

app.get('/error/:username', (req, res) => {
  res.status(404).send(`user with username: ${req.params.username} not found`);
});

const server = app.listen(8080, () => {
  console.log(`app running at ${server.address().port}`);
});
