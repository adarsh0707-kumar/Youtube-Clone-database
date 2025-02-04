const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoUrlId: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  thumbnailUrlId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  // viewedBy: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User'
  // }]



},
  {
    timestamps: true
  }
)


module.exports = mongoose.model('YtVideo', videoSchema);
