const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'YtUser'
  },
  videoUrlId: {
    type: String,
    required: true
  },
  commentText: {
    type: String,
    required: true
  },

},
  {
    timestamps: true
  }
)


module.exports = mongoose.model('YtVideoComment', commentSchema);
