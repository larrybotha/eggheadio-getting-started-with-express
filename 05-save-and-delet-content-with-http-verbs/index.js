const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const app = express();

let users = [];

// build the path for a user's file
const getUserFilePath = username =>
  `${path.join(__dirname, 'users', username)}.json`;

// get a user by username
const getUser = username => {
  // first, parse the response from reading the user's file
  let user = JSON.parse(
    fs.readFileSync(getUserFilePath(username), {encoding: 'utf8'})
  );
  user.name.full = [user.name.first, user.name.last].join(' ');

  // build a more useful object to iterate over on the client for the address
  _.keys(user.location).forEach(
    key => (user.location[key] = _.startCase(user.location[key]))
  );

  return user;
};

// save the user
const saveUser = (username, data) => {
  // get the path to the user's file
  const fp = getUserFilePath(username);

  // delete that file
  fs.unlinkSync(fp);

  // then create another file of the same name using the new data
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), {encoding: 'utf8'});
};

const deleteUser = username => {
  const fp = getUserFilePath(username);

  // delete the file for the user, just as we did with save, but don't bother
  // creating a new file
  fs.unlinkSync(fp);
};

app.engine('pug', cons.pug);

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

app.use('/profilepics', express.static(`${__dirname}/images`));

// allow form data to be submitted
app.use(bodyParser.urlencoded({extended: true}));
// allow json data to be submitted in requests
// Without this, a PUT / POST / PATCH handler receiving the json will have an
// empty body
app.use(bodyParser.json());

// handle requests for favicon before they get to any other handlers.
// end the response
// Without this a request for a user ends up going all the way to getUser,
// and the app throws an error in attempting to retrieve favicon.ico.json
app.get('/favicon.ico', (req, res) => res.end());

// Because users are deleted, we need the index updated
// This is quick and dirty here, and should probably be handled when the user is
// deleted, but it gets the job done for now
app.get('/', (req, res) => {
  let users = [];

  // read all the files in the users directory
  fs.readdir('users', (err, files) => {
    if (err) throw err;

    // map over each file, reading its contents
    files.map(file => {
      fs.readFile(
        path.join(__dirname, 'users', file),
        {encoding: 'utf8'},
        (e, data) => {
          if (e) throw e;
          const user = JSON.parse(data);

          // add a full name prop to the user's name prop
          user.name.full = _.startCase(`${user.name.first} ${user.name.last}`);
          // push this user onto the users list
          users.push(user);

          // if all files have been traversed, then we're ready to render the view
          // with all of the users
          if (users.filter(Boolean).length === files.length) {
            res.render('index', {users});
          }
        }
      );
    });
  });
});

app.get('/:username', (req, res) => {
  const user = getUser(req.params.username);

  res.render('user', {
    user,
    address: user.location,
  });
});

// we can update a user using PUT
app.put('/:username', (req, res) => {
  const {username} = req.params;
  const user = getUser(username);

  // get the body from the request
  // Because it's json, we need to set the app to use bodyParser.json(),
  // otherwise the body won't come through from the request
  user.location = req.body;

  // we save the user, passing through the username and new details to update
  // Because this is a PUT, we send through the entire object to update, as
  // opposed to an PATCH request where we send only the portion of data that
  // will be updated
  saveUser(username, user);
  res.end();
});

// we have a DELETE endpoint for the user
app.delete('/:username', (req, res) => {
  // and we send the username for the app to handle the deletion
  deleteUser(req.params.username);

  // followed by a 200 response to indicate that we successfully deleted the user
  // It's up to the client to handle the response from there.
  // In this case we have the client redirect to the index. This has nothing to do
  // with the server, however.
  res.sendStatus(200);
});

const server = app.listen(8080, () => {
  console.log(`app running at ${server.address().port}`);
});
