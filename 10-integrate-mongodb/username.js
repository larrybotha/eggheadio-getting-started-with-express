const express = require('express');
const router = express.Router({mergeParams: true});

const helpers = require('./helpers');
const User = require('./db');

router.use((req, res, next) => {
  console.log(req.method, 'for', req.params.username);
  next();
});

router.get('/', (req, res) => {
  // we get one user from the database using mongoose's findOne on the model.
  // We instruct how to get the user, i.e. by userna,e, and then in the callback
  // handle whether we got the user or not.
  // Is this where we'd redirect to a 404?
  User.findOne({username: req.params.username}, (err, user) => {
    if (err) throw err;

    res.render('user', {
      user,
      address: user.location,
    });
  });
});

router.put('/', (req, res) => {
  const {username} = req.params;

  // before a db
  // const user = helpers.getUser(username);
  // user.location = req.body;
  // helpers.saveUser(username, user);
  // res.end();

  // to update a user we use findOneAndUpdate, specify how to find that user,
  // and then pass in the object that we want to update.
  // Once that's done we end the request. How about repsonse codes and headers?
  User.findOneAndUpdate({username}, {anything: req.body}, (err, user) => {
    res.end();
  });
});

router.delete('/', (req, res) => {
  helpers.deleteUser(req.params.username);
  res.sendStatus(200);
});

router.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).send('something went wrong');
});

module.exports = router;
