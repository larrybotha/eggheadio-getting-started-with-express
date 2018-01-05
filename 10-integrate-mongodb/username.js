const express = require('express');

const router = express.Router({mergeParams: true});

const helpers = require('./helpers');

router.use((req, res, next) => {
  console.log(req.method, 'for', req.params.username);
  next();
});

router.get('/', (req, res) => {
  const user = helpers.getUser(req.params.username);

  res.render('user', {
    user,
    address: user.location,
  });
});

router.put('/', (req, res) => {
  const {username} = req.params;
  const user = helpers.getUser(username);

  user.location = req.body;

  helpers.saveUser(username, user);
  res.end();
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
