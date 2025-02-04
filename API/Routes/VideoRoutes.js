const express = require('express');
const Router = express.Router();

require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Video = require('../Models/Video');
const Auth = require('../Middleware/checkAuth');


// cloudinary config

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});



// video post request 

Router.post('/upload', Auth, async (req, res) => {

  try {

    // spliting token and storing 

    const token = req.headers.authorization.split(" ")[1];

    // verify token with secreat key

    const userInformation = await jwt.verify(token, process.env.TOKEN);

    // uploading video on cloudinary

    const uploadVideo = await cloudinary.uploader.upload(req.files.Video.tempFilePath, {
      resource_type: 'video'
    });

    // uploading thumbnail on cloudinary
    const uploadThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath);


    // uploading data on databases

    const newVideo = new Video({
      _id: new mongoose.Types.ObjectId,
      title: req.body.title,
      description: req.body.description,
      userId: userInformation._id,
      videoUrl: uploadVideo.secure_url,
      videoUrlId: uploadVideo.public_id,
      thumbnailUrl: uploadThumbnail.secure_url,
      thumbnailUrlId: uploadThumbnail.public_id,
      category: req.body.category,
      tags: req.body.tags.split(",")
    });

    // sending responce to user 

    const newUploadVideoData = await newVideo.save();
    res.status(200).json({
      newVideo: newUploadVideoData
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

// video update request 

Router.put('/:videoId', Auth, async (req, res) => {
  try {

    // varify the user
    const varifyUser = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.TOKEN);

    // finding the video 
    const videoInformation = await Video.findById(req.params.videoId);

    if (videoInformation.userId == varifyUser._id) {

      // update video detail 

      if (req.files) {

        // update the thumbnail

        await cloudinary.uploader.destroy(videoInformation.thumbnailUrlId);
        const updatedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath);
        
        // update data on database
        const updatedData = {
          title: req.body.title,
          description: req.body.description,
          thumbnailUrl: updatedThumbnail.secure_url,
          thumbnailUrlId: updatedThumbnail.public_id,
          category: req.body.category,
          tags: req.body.tags.split(",")

        }

        // save the information

        const updatedVideoInformation = await Video.findByIdAndUpdate(req.params.videoId, updatedData, { new: true });
        res.status(200).json({
          updatedData: updatedVideoInformation
        });

      }

      // if thumbnail not present 

      else {

        const updatedData = {
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          tags: req.body.tags.split(",")
        }

        // save the information

        const updatedVideoInformation = await Video.findByIdAndUpdate(req.params.videoId, updatedData, { new: true });
        res.status(200).json({
          updatedData: updatedVideoInformation
        });
      };



    }

    else {

      return res.status(500).json({
        error: "You don't have permission."
      });

    };

  }

  // chatch error -> universal checking error 

  catch (err) {
    console.error(err);
    res.status(500).json({
      error: err
    });
  };

});



// Delete Router


Router.delete('/:videoId', Auth, async (req, res) => {
  try {

    // varify the user
    const varifyUser = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.TOKEN);

    // finding the video 
    const videoInformation = await Video.findById(req.params.videoId);

    // varifing the user is valid or not

    if (videoInformation.userId == varifyUser._id) {
      // if valid 
      
      await cloudinary.uploader.destroy(videoInformation.videoUrlId, { resource_type: 'video' }); // deleteing  video
      await cloudinary.uploader.destroy(videoInformation.thumbnailUrlId); // deleteing  thumbnil
      const deletedData = await Video.findByIdAndDelete(req.params.videoId); // deleteing  data from databases


      res.status(200).json({
        deletedData: deletedData
      });

    }
    else {
      // otherwise
      res.status(500).json({
        error: "You don't have permission."
      });
    };

  }

  // chatch error -> universal checking error 

  catch (err) {
    console.error(err);
    res.status(500).json({
      error: err
    });
  };

});


// like requist

Router.put('/like/:videoId', Auth, async (req, res) => {
  try {

    // varify the user
    const varifyUser = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.TOKEN);

    // finding the video 
    const videoInformation = await Video.findById(req.params.videoId);

    // checking video is liked by user or not
    if (videoInformation.likedBy.includes(varifyUser._id)) {
      res.status(500).json({
        error: "Already Like"
      });
    };

    // checking video is disliked by user or not
    
    if (videoInformation.dislikedBy.includes(varifyUser._id)) {

      videoInformation.dislikes -= 1;
      videoInformation.dislikedBy = videoInformation.dislikedBy.filter(userId => userId.toString() != varifyUser._id);
    };

    // if user is not like and may be dislike

    videoInformation.likes += 1;
    videoInformation.likedBy.push(varifyUser._id);
    await videoInformation.save();

    res.status(200).json({
      msg: 'like'
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


// dislike requist

Router.put('/dislike/:videoId', Auth, async (req, res) => {
  try {

    // varify the user
    const varifyUser = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.TOKEN);

    // finding the video 
    const videoInformation = await Video.findById(req.params.videoId);

    // checking video is disliked by user or not

    if (videoInformation.dislikedBy.includes(varifyUser._id)) {
      res.status(500).json({
        error: "Already Disike"
      });
    };

    // checking video is liked by user or not

    if (videoInformation.likedBy.includes(varifyUser._id)) {

      videoInformation.likes -= 1;
      videoInformation.likedBy = videoInformation.likedBy.filter(userId => userId.toString() != varifyUser._id);
    };

    // if user is may be like and not dislike then

    videoInformation.dislikes += 1;
    videoInformation.dislikedBy.push(varifyUser._id);
    await videoInformation.save();

    res.status(200).json({
      msg: 'dislike'
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

// view request
Router.put('/views/:videoId', async (req, res) => {
  try {
    const viewVideo = await Video.findById(req.params.videoId);
    viewVideo.views += 1;
    await viewVideo.save();

    res.status(200).json({
      msg: "Viewed..."
    });
    
  }
  catch (err) {
    console.error(err);
    res.status(500).json({
      error: err
    });
  };

});


module.exports = Router;