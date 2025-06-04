const Post = require("../models/Post");

// Create a new post
exports.createPost = async (req, res, next) => {
    try {
        const { title, content } = req.body;

        const newPost = new Post({
            title,
            content,
            author: req.user.id
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        next(err);
    }
};

// Get all posts
exports.getAllPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().populate("author", "username email");
        res.json(posts);
    } catch (err) {
        next(err);
    }
};

// Get a single post by ID
exports.getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "username email");
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    } catch (err) {
        next(err);
    }
};

// Update a post
exports.updatePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;

        await post.save();

        // Populate author after saving
        const updatedPost = await Post.findById(post._id).populate("author");

        res.json(post);
    } catch (err) {
        next(err);
    }
};

// Delete a post
exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await post.deleteOne();
        res.json({ message: "Post deleted" });
    } catch (err) {
        next(err);
    }
};
