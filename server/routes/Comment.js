const express = require("express");
const commentController = require("../controllers/Comment");
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

const router = express.Router();

// Add comment to a post (authenticated)
router.post("/:postId", verify, commentController.addComment);

// Get comments for a post (public)
router.get("/:postId", commentController.getComments);

// Delete comment (only owner or admin)
router.delete("/:id", verify, commentController.deleteComment);

module.exports = router;
