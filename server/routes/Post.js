const express = require("express");
const postController = require("../controllers/Post");
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

const router = express.Router();

// Create new post (authenticated users)
router.post("/", verify, postController.createPost);

// Get all posts (public)
router.get("/", postController.getAllPosts);

// Get a single post by ID (public)
router.get("/:id", postController.getPostById);

// Update a post (only owner or admin)
router.put("/:id", verify, postController.updatePost);

// Delete a post (only owner or admin)
router.delete("/:id", verify, postController.deletePost);

module.exports = router;
