// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
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
  origin: ["http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use(
  session({
    secret: process.env.clientSecret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect(process.env.MONGODB_STRING, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once("open", () =>
  console.log("Now connected to MongoDB Atlas.")
);

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
