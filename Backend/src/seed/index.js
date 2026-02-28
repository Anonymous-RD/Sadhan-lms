require("dotenv").config({ path: "../.env" }); // Adjust depending on run context, assuming run from Backend root
const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

require("dotenv").config();

// This is DEMO v0 implementation

const users = [
  {
    email: "learner@test.com",
    password: "123456",
    role: "learner",
    phoneNumber: "1234567890",
  },
  {
    email: "trainer@test.com",
    password: "123456",
    role: "trainer",
    phoneNumber: "0987654321",
  },
  {
    email: "admin@test.com",
    password: "123456",
    role: "admin",
    phoneNumber: "1111111111",
  },
];

const seedData = async () => {
  try {
    // If running from Backend root, process.env.MONGODB_URI should be available
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/lms_demo_v0";
    await mongoose.connect(uri);
    console.log("MongoDB Connected for Seeding...");

    await User.deleteMany();
    await Course.deleteMany();
    await Progress.deleteMany();

    // Create Users
    const createdUsers = await User.insertMany(users);

    // Use manual save since hooks don't run on insertMany, to ensure password is hashed
    await User.deleteMany();
    const savedUsers = [];
    for (const u of users) {
      const user = new User(u);
      await user.save();
      savedUsers.push(user);
    }

    const trainerUser = savedUsers.find((u) => u.role === "trainer");

    // Create Demo Courses
    const courses = [
      {
        title: "Introduction to React for Beginners",
        description: "Learn the basics of React, components, state, and props.",
        youtubeVideoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
        language: "English",
        createdBy: trainerUser._id,
        modules: [
          {
            title: "Getting Started with React",
            description: "Setup and first app",
            order: 1,
          },
          {
            title: "Components and Props",
            description: "Building reusable UI",
            order: 2,
          },
          {
            title: "State and Lifecycle",
            description: "Managing data in components",
            order: 3,
          },
        ],
        quiz: [
          {
            question: "What is React used for?",
            options: [
              "Backend routing",
              "Building user interfaces",
              "Database management",
              "Server rendering",
            ],
            correctAnswer: "Building user interfaces",
          },
          {
            question: "What do we use to pass data to components?",
            options: ["State", "Props", "Render", "Functions"],
            correctAnswer: "Props",
          },
          {
            question: "Which method is used to update state?",
            options: [
              "updateState()",
              "changeState()",
              "setState()",
              "modifyState()",
            ],
            correctAnswer: "setState()",
          },
        ],
      },
      {
        title: "Advanced Node.js Patterns",
        description:
          "Deep dive into asynchronous programming, streams, and performance in Node.js.",
        youtubeVideoUrl: "https://www.youtube.com/watch?v=ENrzD9HAZK4",
        language: "English",
        createdBy: trainerUser._id,
        modules: [
          {
            title: "Event Loop Deep Dive",
            description: "Understanding Node architecture",
            order: 1,
          },
          {
            title: "Streams and Buffers",
            description: "Handling large data efficiently",
            order: 2,
          },
          {
            title: "Clustering and Performance",
            description: "Scaling Node applications",
            order: 3,
          },
        ],
        quiz: [
          {
            question: "Which is NOT a core module in Node.js?",
            options: ["fs", "http", "express", "path"],
            correctAnswer: "express",
          },
          {
            question: "What is the Event Loop responsible for?",
            options: [
              "Parsing HTML",
              "Handling asynchronous operations",
              "Styling UI",
              "Database design",
            ],
            correctAnswer: "Handling asynchronous operations",
          },
          {
            question: "Which streams are both readable and writable?",
            options: ["Readable", "Writable", "Duplex", "Transform"],
            correctAnswer: "Duplex",
          },
        ],
      },
    ];

    await Course.insertMany(courses);

    console.log("Data Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error with seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
