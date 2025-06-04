// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("./passport");

// Import models to register with mongoose
require("./models/User");
require("./models/Post");
require("./models/Comment");

// [SECTION] Routes
const userRoutes = require("./routes/User");
const postRoutes = require("./routes/Post");
const commentRoutes = require("./routes/Comment");

// [SECTION] Environment Setup
require("dotenv").config();

// [SECTION] Server Setup
const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    // Add your deployed frontend URLs here, e.g.:
    // "https://your-app.netlify.app",
    // "https://yourdomain.com"
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Use MongoStore for sessions instead of default MemoryStore
app.use(
  session({
    secret: process.env.JWT_SECRET_KEY || process.env.clientSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_STRING,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in prod, false otherwise
      httpOnly: true, // prevent JS access to cookies
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB_STRING, {
  // Optional but explicit for older Mongoose versions
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("Now connected to MongoDB Atlas.");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// [SECTION] Backend Routes
app.use("/user", userRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);

// [SECTION] Server Gateway Response
if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`API is now online on port ${process.env.PORT || 3000}`);
  });
}

// Export app and mongoose for testing/grading (optional)
module.exports = { app, mongoose };
