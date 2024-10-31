const mongoose = require('mongoose')

const { Schema } = mongoose;

const commentSchema = new Schema({
  text: { type: String, required: true },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Comments', commentSchema);