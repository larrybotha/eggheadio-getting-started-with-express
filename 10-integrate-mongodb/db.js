const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';

// const findUsers = (db, cb) => {
//   const cursor = db.collection('users').find();

//   cursor.each((err, doc) => {
//     if (doc != null) {
//       console.dir(doc);
//     } else {
//       cb();
//     }
//   });
// };

// MongoClient.connect(uri, (err, client) => {
//   const db = client.db('test');

//   findUsers(db, () => client.close());
// });

mongoose.connect(`${uri}/test`);

const db = mongoose.connection;

db.on('error', err => console.error(`connection error: ${err}`));

db.once('open', cb => {
  console.log('db connected');
});

const userSchema = mongoose.Schema({
  username: String,
  gender: String,
  name: {
    title: String,
    first: String,
    last: String,
    full: String,
  },
  location: {
    street: String,
    city: String,
    state: String,
    zip: Number,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

// User.find({}, (err, users) => {
//   console.log(users);
// });
