const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  username: mongoose.SchemaTypes.String,
  discordId: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  valorantAccount: {
    type: mongoose.SchemaTypes.String,
    default: '?',
  },
});

module.exports = mongoose.model('Account', AccountSchema);
