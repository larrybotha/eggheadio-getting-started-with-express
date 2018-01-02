const fs = require('fs');
const path = require('path');
const _ = require('lodash');

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

module.exports = {
  deleteUser,
  getUser,
  saveUser,
  verifyUser,
};
