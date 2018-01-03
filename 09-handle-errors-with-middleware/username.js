const express = require('express');

const router = express.Router({mergeParams: true});

const helpers = require('./helpers');

// We don't need 'all' here - we're telling the router to fire this handler for
// all requests.
// This is the same as using router.use(fn);
// router.all('/', (req, res, next) => {
// Our function here is a custom router-level middleware
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

// We can define custom error handlers when defining middleware with 4 arguments
// If we don't define our own error handler, express will invoke its own, which
// shows stack trace info when not in production mode, and a 500 error when in
// production mode
router.use((err, req, res, next) => {
  console.error(err.stack);

  // notify the client that there was an error by specifying the status code
  res.status(500).send('something went wrong');
});

module.exports = router;
