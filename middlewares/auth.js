// Third
const jwt = require('jsonwebtoken');

// Local
const User = require('../models/user');
const envVars = require('../config/envVars');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer', '').trim();
    const decoded = jwt.verify(token, envVars.SECRET_TOKEN);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).send({ error: 'Please authenticate!' });
  }
};

module.exports = authenticate;
