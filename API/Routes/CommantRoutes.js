const express = require('express');
const Router = express.Router();

require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Comment = require('../Models/Commant');
const Auth = require('../Middleware/checkAuth');


// post comment

Router.post('/new-comment/:videoId', Auth, async (req, res) => {
  try {


    // varify the user
    const varifyUser = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.TOKEN);


    const newComment = new Comment({
      _id: new mongoose.Types.ObjectId,
      videoUrlId: req.params.videoId,
      userId: varifyUser._id,
      commentText: req.body.commentText
    });

    const comment = await newComment.save();
    res.status(200).json({
      newComment: comment
    });

  }

  // chatch error -> universal checking error 
  catch (err) {
    console.error(err);
    res.status(500).json({
      error: err
    });
  };

});

// get all comments


Router.get('/:videoId', async (req, res) => {
  try {


    // varify the user
    // const varifyUser = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.TOKEN);


    const allComments = await Comment.find({
      videoUrlId: req.params.videoId
    }).populate('userId', 'channelName logoUrl email');

    res.status(200).json({
      commentList: allComments
    });

  }

  // chatch error -> universal checking error 
  catch (err) {
    console.error(err);
    res.status(500).json({
      error: err
    });
  };

});


// update comment

Router.put('/:commentId', Auth, async (req, res) => {

  try {

    // varify the user
    const varifyUser = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.TOKEN);
    console.log(varifyUser)

    const comment = await Comment.findById(req.params.commentId);
    console.log(comment);

    if (comment.userId != varifyUser._id) {
      return res.status(500).json({
        error: "You Can ony Update own Comment"
      });
    }

    comment.commentText = req.body.commentText;
    const updatedComment = await comment.save();
    res.status(200).json({
      updatedComment: updatedComment
    });

  }

  // chatch error -> universal checking error 
  catch (err) {
    console.error(err);
    res.status(500).json({
      error: err
    });
  };

});



// Delete comment

Router.delete('/:commentId', Auth, async (req, res) => {

  try {

    // varify the user
    const varifyUser = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.TOKEN);
    console.log(varifyUser)

    const comment = await Comment.findById(req.params.commentId);
    console.log(comment);

    if (comment.userId != varifyUser._id) {
      return res.status(500).json({
        error: "You Can ony Delete own Comment"
      });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    const deletedComment = await comment.save();
    res.status(200).json({
      deletedComment: "Comment Deleted.."
    });

  }

  // chatch error -> universal checking error 
  catch (err) {
    console.error(err);
    res.status(500).json({
      error: err
    });
  };

});



module.exports = Router;