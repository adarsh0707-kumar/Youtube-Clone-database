const express = require('express');
const Router = express.Router();

require('dotenv').config();

const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../Models/User');
const Auth = require('../Middleware/checkAuth');



// cloudinary config


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});






// post requist for signup

Router.post('/signup', async (req, res) => {
  try {

    // checking user is exist or not;

    const users = await User.find({
      email: req.body.email
    });

    // if user exist 
    // using email -> email is unique;

    if (users.length > 0) {
      return res.status(500).json({
        error: "Email already registered."
      });

    }
    // otherwise registration is compleat
    else {

      // pa{ default: ssword hassing

      const hashCode = await bcrypt.hash(req.body.password, 10);

      // uploding logo;

      const uploadedImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath);

      // posting data on databases;

      const newUser = new User({
        _id: new mongoose.Types.ObjectId,
        channelName: req.body.channelName,
        email: req.body.email,
        phone: req.body.phone,
        password: hashCode,
        logoUrl: uploadedImage.secure_url,
        logoUrlId: uploadedImage.public_id
      });

      const ytUser = await newUser.save();

      res.status(200).json({
        newUser: ytUser
      });

    };

  }

  // chatch error -> universal checking error 

  catch (err) {

    console.error(err);
    res.status(500).json({
      msg: err
    });

  };

});



// for login 

Router.post('/login', async (req, res) => {

  try {

    // checking user is exist or not

    const users = await User.find({
      email: req.body.email
    });

    // user is not exist 

    if (users.length == 0) {
      return res.status(404).json({
        error: "Email is registered..."
      });
    }

    // user is exist 

    else {

      // compare the password
      const isValid = await bcrypt.compare(req.body.password, users[0].password);

      // isValid to flase
      if (!isValid) {
        return res.status(500).json({
          error: "Invalid Password"
        });
      }

      // password is true 
      else {
        // token making 
        const token = jwt.sign(
          {
            _id: users[0]._id,
            channelName: users[0].channelName,
            email: users[0].email,
            phone: users[0].phone,
            logoUrlId: users[0].logoUrlId
          },

          // token secqurity
          process.env.TOKEN,
          {
            // token expery
            expiresIn: '365d'
          }
        )

        // data return 
        res.status(200).json({
          _id: users[0]._id,
          channelName: users[0].channelName,
          email: users[0].email,
          phone: users[0].phone,
          logoUrlId: users[0].logoUrlId,
          logoUrl: users[0].logoUrl,
          token: token,
          subscribers: users[0].subscribers,
          subscribedChannels: users[0].subscribedChannels
        })

      }
    }

  }

  // chatch error -> universal checking error 


  catch (err) {
    console.error(err);
    res.status(500).json({
      msg: err
    });
  }

});

// subscribe request

Router.put('/subscribe/:userBId', Auth, async (req, res) => {

  try {
    // varify the user
    const varifyUserA = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.TOKEN);
    console.log(varifyUserA)
    // finding the user
    const userBInformation = await User.findById(req.params.userBId);

    // checking user is subscribed or not 
    if (userBInformation.subscribedBy.includes(varifyUserA._id)) {
      // if subscribed 
      return res.status(500).json({
        error: "Already subscribed..."
      });
    }


    // user can not subscribed it self
    if (userBInformation._id == varifyUserA._id) {
      res.status(500).json({
        error: "You can not subscribed it self"
      })
    }
    // otherwise 
    else {
      userBInformation.subscribers += 1;  // inscrease the subscribers 
      userBInformation.subscribedBy.push(varifyUserA._id); // store the subscribers id
      await userBInformation.save();

      const userAInformation = await User.findById(varifyUserA._id); // finding subscribers data or information
      userAInformation.subscribedChannels.push(userBInformation._id); // store the subscribed channal id
      await userAInformation.save();
    }


    res.status(200).json({
      msg: "subscribed..."
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


// unsubscribe request

Router.put('/unsubscribe/:userBId', Auth, async (req, res) => {

  try {
    // varify the user
    const varifyUserA = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.TOKEN);

    // finding the user
    const userBInformation = await User.findById(req.params.userBId);

    // checking user is unsubscribed or not 
    if (userBInformation.subscribedBy.includes(varifyUserA._id)) {
      // if subscribed 
      userBInformation.subscribers -= 1;  // decrises the subscribers 
      userBInformation.subscribedBy = userBInformation.subscribedBy.filter(userId => userId.toString() != varifyUserA._id); // remove the subscribers id
      await userBInformation.save();

      const userAInformation = await User.findById(varifyUserA._id); // finding subscribers data or information
      userAInformation.subscribedChannels = userAInformation.subscribedChannels.filter(userId => userId.toString() != userBInformation._id); // store the subscribed channal id
      await userAInformation.save();


      res.status(200).json({
        msg: "unsubscribed..."
      });
    }

    // otherwise 

    else {
      return res.status(500).json({
        error: "Not subscribed..."
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








module.exports = Router;