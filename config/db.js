const mongoose = require('mongoose');
const db_connect_uri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017';

mongoose.connect(db_connect_uri);