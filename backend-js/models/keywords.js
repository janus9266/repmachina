const mongoose = require('mongoose');

const KeywordSchema = new mongoose.Schema({
    keyword: { type: String, required: true},
    text: { type: String, required: true },
})

module.exports = mongoose.model('Keyword', KeywordSchema);