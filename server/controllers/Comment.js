const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Add a comment to a post
exports.addComment = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const newComment = new Comment({
            post: postId,
            author: req.user.id,
            content
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (err) {
        next(err);
    }
};

// Get comments for a post
exports.getComments = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId }).populate("author", "username email");
        res.json(comments);
    } catch (err) {
        next(err);
    }
};

// Delete a comment
exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (comment.author.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await comment.deleteOne();
        res.json({ message: "Comment deleted" });
    } catch (err) {
        next(err);
    }
};
