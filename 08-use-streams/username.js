const express = require('express');

// If we don't set mergeParams to true, then params will not be sent through to
// this router, and we get a weird error about 'Path must be a string'
// We create a router object, which is actually an object that is available when
// instantiating the app with express()
const router = express.Router({mergeParams: true});

const helpers = require('./helpers');

// now we treat router as a mini-app
// Instead of specifying the full path, we treat the router as the root of the
// path. We define the root of the path on the app, and specify that this is the
// router we want to use:
// app.use('/:username', userRouter);
router.all('/', (req, res, next) => {
  console.log(req.method, 'for', req.params.username);
  next();
});

router.get('/', helpers.verifyUser, (req, res) => {
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

module.exports = router;
