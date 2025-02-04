const express = require('express');
const app = express();
require('dotenv').config();

const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

const userRouters = require('./API/Routes/UserRoutes');
const videoRouters = require('./API/Routes/VideoRoutes');
const commentRouters = require('./API/Routes/CommantRoutes');



  
const connectWithDatabase = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected with DataBases...");
  }
  catch (err) {
    console.error(err);
  }
}
connectWithDatabase();

app.use(bodyParser.json());

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp'
}));

app.use('/user', userRouters);
app.use('/video', videoRouters);
app.use('/comment', commentRouters);






module.exports = app;