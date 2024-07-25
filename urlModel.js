const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    original_url: {type: String,required: true},
    short_url: {type: String,required: true, unique: true},
      });

module.exports = mongoose.model('URLModel', urlSchema);
