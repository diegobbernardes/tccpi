const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://diego:12345@cluster0-rwuit.mongodb.net/anapps?retryWrites=true', { useCreateIndex: true, useNewUrlParser: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;