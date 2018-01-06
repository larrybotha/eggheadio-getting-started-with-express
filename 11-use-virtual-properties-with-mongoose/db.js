const _ = require('lodash');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';

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
  },
  location: {
    street: String,
    city: String,
    state: String,
    zip: Number,
  },
});

// This is a virtual property that doesn't exist in the structure of a user.
// We supply how we want to access the property, i.e. via name.full, and we
// provide a function which controls what is actually returned when that property
// is accessed.
userSchema.virtual('name.full').get(function() {
  const full = [this.name.first, this.name.last].map(_.startCase).join(' ');

  return full;
});

// This is a setter for the virtual property.
// We obviously can't set the virtual property directly on the document, but if we
// allow for setting via the client, we need to handle it on the server
// We can't rely on mongoose's findOneAndUpdate when setting virtual properties, so
// in the PUT request we need to modify how we update the record.
userSchema.virtual('name.full').set(function(value) {
  const parts = value.trim().split(' ');

  this.name.first = parts[0];
  this.name.last = parts[1];
});

const User = mongoose.model('User', userSchema);

module.exports = User;
