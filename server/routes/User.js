const express = require("express");
const userController = require("../controllers/User");
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me", verify, userController.getProfile);

// Admin-only route to create admin user
router.post("/create-admin", verify, verifyAdmin, userController.createAdmin);

module.exports = router;
