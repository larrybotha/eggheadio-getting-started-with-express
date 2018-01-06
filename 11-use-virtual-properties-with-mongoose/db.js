const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';

// this is updating using mongodb directly
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

// instead we can use mongoose as an ORM to do some of the heavy lifting
// Connect mongoose to our db
mongoose.connect(`${uri}/test`);

// get the database object from the connection
const db = mongoose.connection;

// listen for errors on the database, and log them out
db.on('error', err => console.error(`connection error: ${err}`));

// when the db opens a connection, notify that it's up
db.once('open', cb => {
  console.log('db connected');
});

// create a user schema so mongoose knows how to create objects.
// What happens if we try update a field that doesn't exist?
// Mongoose won't update the record
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

// mongo users the name in the modal function to find the users collection by
// lowercasing and pluralising the name
const User = mongoose.model('User', userSchema);

module.exports = User;

// User.find({}, (err, users) => {
//   console.log(users);
// });
