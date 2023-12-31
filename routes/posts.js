const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const verifyToken = require('../verifyToken');

// CREATE POST
router.post("/create", verifyToken, async (req, res) => {
    try {
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        // Proper error handling
        res.status(500).json(err);
    }
});

// UPDATE POST
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.status(200).json(updatedPost);
    } catch (err) {
        // Proper error handling
        res.status(500).json(err);
    }
});

// DELETE POST
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ postId: req.params.id });
        res.status(200).json("Post has been deleted!");
    } catch (err) {
        // Proper error handling
        res.status(500).json(err);
    }
});

// GET POST DETAILS
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json("Post not found");
        }
        res.status(200).json(post);
    } catch (err) {
        // Proper error handling
        res.status(500).json(err);
    }
});

// GET POSTS
router.get("/", async (req, res) => {
    const query = req.query;
    try {
        const searchFilter = {
            title: { $regex: query.search, $options: "i" }
        };
        const posts = await Post.find(query.search ? searchFilter : null);
        res.status(200).json(posts);
    } catch (err) {
        // Proper error handling
        res.status(500).json(err);
    }
});

// GET USER POSTS
router.get("/user/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId });
        res.status(200).json(posts);
    } catch (err) {
        // Proper error handling
        res.status(500).json(err);
    }
});

// LIKE/UNLIKE POST
router.put("/:id/like", verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id; // Assuming you store user ID in the request after token verification

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json("Post not found");
        }

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter((like) => like.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }

        const updatedPost = await Post.findByIdAndUpdate(postId, { likes: post.likes }, { new: true });
        res.status(200).json(updatedPost);
    } catch (err) {
        // Proper error handling
        res.status(500).json(err);
    }
});

module.exports = router;