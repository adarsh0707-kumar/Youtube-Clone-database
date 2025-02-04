const jwt = require('jsonwebtoken');

require('dotenv').config();

// verifeing user

module.exports = async (req, res, next) => {
  try {

    // spliting token and storing 

    const token = req.headers.authorization.split(" ")[1];

    // verify token with secreat key

    await jwt.verify(token, process.env.TOKEN);

    // forwarding to another function
    next()


  }


  // chatch error -> universal checking error 

  catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Invalid token."
    })
  }
}