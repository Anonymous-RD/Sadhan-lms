require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./src/config/db");

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Basic route for testing
app.get("/", (req, res) => {
  res.send("LMS Demo API is running... This is DEMO v0 implementation");
});

// Routes
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/courses", require("./src/routes/courseRoutes"));
app.use("/progress", require("./src/routes/progressRoutes"));
app.use("/quiz", require("./src/routes/quizRoutes"));
app.use("/certificate", require("./src/routes/certificateRoutes"));
app.use("/wishlist", require("./src/routes/wishlistRoutes"));

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
