// Third
const express = require('express');

// Local
const router = new express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');
const { ObjectID } = require('mongodb');
const authenticate = require('../middlewares/auth');

router.post('/posts', authenticate, async (req, res) => {
  console.log('req.body:', req.body);
  const post = new Post({
    ...req.body,
    author: req.user._id,
  });

  try {
    console.log('post:', post);
    await post.save();
    res.status(201).send({ message: 'POST CREATED', post });
  } catch (err) {
    res.send({ error: err });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find({});
    res.send(posts);
  } catch (err) {
    res.status(500).send({ error: 'Error getting all posts' });
  }
});

router.get('/posts/:id', authenticate, async (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send({ error: 'Invalid post ID' });
  }
  try {
    const post = await Post.findOne({ _id, author: req.user._id });
    if (!post) {
      return res.status(404).send({ error: 'Post not find' });
    }
    res.send(post);
  } catch (err) {
    res.status(500).send();
  }
});

router.patch('/posts/:id', authenticate, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  console.log('Object.keys(req.body):', Object.keys(req.body));
  const allowedUpdates = ['description', 'title'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates' });
  }
  if (!ObjectID.isValid(_id)) {
    res.status(404).send();
  }
  try {
    const post = await Post.findOne(
      {
        _id: req.params.id,
        author: req.user._id,
      },
      (err) => {
        if (err) {
          res.status(404).send({ error: 'Post not find' });
        }
      },
    );
    updates.forEach((update) => (post[update] = req.body[update]));
    await post.save();
    res.send({ message: 'POST UPDATED', post });
  } catch (err) {
    res.status(400).send({ error: err });
  }
});

router.delete('/posts/:id', authenticate, async (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send({ error: 'Invalid post ID' });
  }
  try {
    const deletePost = await Post.findByIdAndRemove(
      {
        $and: [{ _id }, { author: req.user._id }],
      },
      (err) => {
        if (err) {
          res.send({
            error:
              'A problem has been generated. It is possible you are not the post owner',
          });
        }
      },
    );
    if (!deletePost) {
      return res.status(404).send({ error: 'Post not find' });
    }
    res.send({ message: 'POST DELETED', post: deletePost });
  } catch (err) {
    res.status(500).send();
  }
});

// Post a comment on a blogspot
router.post('/posts/:id/comment', authenticate, async (req, res) => {
  const _id = req.params.id;
  const userID = req.user._id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send({ error: 'Invalid comment ID' });
  }
  if (!ObjectID.isValid(userID)) {
    return res.status(404).send();
  }
  const comment = new Comment({
    ...req.body,
    author: userID,
    postId: _id,
  });
  try {
    await comment.save();
    res.status(201).send({ message: 'COMMENT CREATED', comment });
  } catch (err) {
    res.status(400).send({ error: err });
  }
});

// Get all comments related to the post
router.get('/posts/:id/comment', async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    // la funcion populate() se encarga de poblar de "comentarios" a un "post". Estableciendo una relación de llave foránea.
    console.log('post.comments:', post.comments);
    await post.populate('comments').execPopulate();
    console.log('post.comments:', post.comments);
    res.send(post.comments);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

module.exports = router;
