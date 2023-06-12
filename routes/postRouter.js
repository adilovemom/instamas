const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schema/user');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const Post = require('../schema/post');
const BlacklistedToken = require('../middleware/blacklistedToken');








 
 router.post('/posts/add', authenticateToken, async (req, res) => {
    try {
      
      const userId = req.userId;
  
      
      const { title, body, device, no_of_comments } = req.body;
      if (!title || !body || !device || !no_of_comments) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      
      const newPost = new Post({
        title,
        body,
        device,
        no_of_comments,
        user: userId // Associate the post with the logged-in user
      });
      await newPost.save();
  
      res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
      console.error('Post creation error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  
router.get('/posts', authenticateToken, async (req, res) => {
    try {
      
      const userId = req.userId;
  
      
      const { device, minComments, maxComments, page = 1, limit = 3 } = req.query;
  
      
      const filter = { user: userId };
      if (device) {
        filter.device = device;
      }
      if (minComments) {
        filter.no_of_comments = { $gte: Number(minComments) };
      }
      if (maxComments) {
        filter.no_of_comments = { ...filter.no_of_comments, $lte: Number(maxComments) };
      }
  
      
      const posts = await Post.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
  
      res.json({ posts });
    } catch (error) {
      console.error('Error retrieving posts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


 
router.patch('/posts/:postId', authenticateToken, async (req, res) => {
    try {
      
      const userId = req.userId;
      
      const postId = req.params.postId;
  
      
      const post = await Post.findOne({ _id: postId, user: userId });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      
      post.title = req.body.title;
      post.body = req.body.body;
      post.device = req.body.device;
      post.no_of_comments = req.body.no_of_comments;
      await post.save();
  
      res.json({ message: 'Post updated successfully' });
    } catch (error) {
      console.error('Post update error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
  router.delete('/posts/:postId', authenticateToken, async (req, res) => {
    try {
      
      const userId = req.userId;
      
      const postId = req.params.postId;
  
      
      const post = await Post.findOne({ _id: postId, user: userId });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
     
      await post.remove();
  
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Post deletion error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  
router.get('/posts/top', authenticateToken, async (req, res) => {
    try {
      
      const userId = req.userId;
  
      
      const { page = 1, limit = 3 } = req.query;
  
      
      const posts = await Post.find({ user: userId })
        .sort({ no_of_comments: -1 }) 
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
  
      res.json({ posts });
    } catch (error) {
      console.error('Error retrieving top posts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  
router.get('/posts', authenticateToken, async (req, res) => {
    try {
      
      const userId = req.userId;
  
      
      const { devices, minComments, maxComments, page = 1, limit = 3 } = req.query;
  
    
      const filter = { user: userId };
      if (devices) {
        const deviceList = devices.split(','); // Assuming multiple devices are separated by commas
        filter.device = { $in: deviceList };
      }
      if (minComments) {
        filter.no_of_comments = { $gte: Number(minComments) };
      }
      if (maxComments) {
        filter.no_of_comments = { ...filter.no_of_comments, $lte: Number(maxComments) };
      }
  
      
      const posts = await Post.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
  
      res.json({ posts });
    } catch (error) {
      console.error('Error retrieving posts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

router.get('/posts/top', authenticateToken, async (req, res) => {
    try {
      
      const userId = req.userId;
  
      
      const { devices, page = 1, limit = 3 } = req.query;
  
      
      const filter = { user: userId };
      if (devices) {
        const deviceList = devices.split(','); 
        filter.device = { $in: deviceList };
      }
  
      
      const posts = await Post.find(filter)
        .sort({ no_of_comments: -1 }) 
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
  
      res.json({ posts });
    } catch (error) {
      console.error('Error retrieving top posts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


router.post('/logout', async (req, res) => {
    try {
      const { token } = req.body;
  
     
      const blacklistedToken = new BlacklistedToken({ token });
      await blacklistedToken.save();
  
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Error logging out:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  module.exports = router;