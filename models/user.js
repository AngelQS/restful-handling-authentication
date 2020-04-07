// Third
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Local
const envVars = require('../config/envVars');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number');
      }
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error('Please enter your password');
      } else if (validator.equals(value.toLowerCase(), 'password')) {
        throw new Error('Password is invalid');
      } else if (validator.contains(value.toLowerCase(), 'password')) {
        throw new Error('Password should not contain password');
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
});

UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

UserSchema.statics.checkValidCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login. User does not exist');
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login. User password does not match');
  }

  return user;
};

UserSchema.methods.newAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user.id.toString() }, envVars.SECRET_TOKEN, {
    expiresIn: '7 days',
  });
  user.tokens = user.tokens.concat({ token });
  console.log('CONCAT user.tokens:', user.tokens);
  await user.save();
  return token;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
