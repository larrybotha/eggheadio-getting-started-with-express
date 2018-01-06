const express = require('express');
const router = express.Router({mergeParams: true});

const helpers = require('./helpers');
const User = require('./db');

router.use((req, res, next) => {
  console.log(req.method, 'for', req.params.username);
  next();
});

router.get('/', (req, res) => {
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

  // now that we have a virtual property we can't use findOneAndUpdate - it is
  // convenience function available only for properties defined on the schema.
  // What we need to do is find the specific record, and then manually save it.
  // User.findOneAndUpdate(
  //   {username},
  //   {location: req.body.location, name: req.body.name},
  //   (err, user) => {
  //     res.end();
  //   }
  // );

  // get the user
  User.findOne({username: req.params.username}, (err, user) => {
    if (err) console.log(err);

    // assign properties direcly on the user
    // We assign to the virtual property, which the setter than handles
    user.name.full = req.body.name;
    user.location = req.body.location;
    // save the updates to the user, and then end the response.
    user.save(() => res.end());
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
module.exports = router;
