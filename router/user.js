// Third
const express = require('express');

// Local
const router = new express.Router();
const User = require('../models/user');
const { ObjectID } = require('mongodb');
const authenticate = require('../middlewares/auth');

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.newAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.checkValidCredentials(
      req.body.email,
      req.body.password,
    );
    const token = await user.newAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send({ err: 'User not found' });
  }
});

router.get('/users/me', authenticate, async (req, res) => {
  res.send(req.user);
});

router.patch('/users/me', authenticate, async (req, res) => {
  const updates = Object.keys(req.body); // Recive the body keys, eg. name, email, password and age. Can but shouldn't have to recive another fields more than items described anteriorly
  console.log('Object.keys(req.body):', Object.keys(req.body));
  const allowedUpdates = ['name', 'email', 'password', 'age']; // If fields on updates const are included in isValidOperation const, it should run, otherwise, throws an error
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );
  console.log('isValidOperation:', isValidOperation);
  const _id = req.user._id;

  if (!isValidOperation) {
    res.status(400).send({
      error: 'Invalid request',
    });
  }

  if (!ObjectID.isValid(_id)) {
    return res.status(404).send({
      error: 'Invalid user ID',
    });
  }

  try {
    updates.forEach((update) => {
      console.log('update:', update);
      console.log(`${req.user[update]} = ${req.body[update]}`);
      req.user[update] = req.body[update];
      console.log('req.user[update]:', req.user[update]);
    });
    await req.user.save();
    console.log('req.user.save:', req.user.save);
    res.send(req.user);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

router.delete('/users/me', authenticate, async (req, res) => {
  if (!ObjectID.isValid(req.user._id)) {
    return res.status(404).send({ error: 'Invalid user ID' });
  }

  try {
    await req.user.remove();
    res.send({ message: 'DELETED', user: req.user });
  } catch (err) {
    res.status(500).send();
  }
});

router.post('/users/logout', authenticate, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      console.log(
        `${token.token} !== ${req.token}:`,
        token.token !== req.token,
      );
      res.send({ message: 'You are logged out' });
      return token.token !== req.token;
    });
  } catch (err) {
    await req.user.save();
    res.send();
  }
});

router.post('/users/logoutall', authenticate, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({ message: 'All users are logged out' });
  } catch (err) {
    res.status(500), send({ error: 'Error on logout all' });
  }
});

module.exports = router;
