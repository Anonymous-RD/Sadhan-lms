require("dotenv").config({ path: "../.env" }); // Adjust depending on run context, assuming run from Backend root
const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

require("dotenv").config();

// This is DEMO v0 implementation

const users = [
  {
    name: "Demo Learner",
    email: "learner@test.com",
    password: "123456",
    role: "learner",
    phoneNumber: "1234567890",
  },
  {
    name: "Demo Trainer",
    email: "trainer@test.com",
    password: "123456",
    role: "trainer",
    phoneNumber: "0987654321",
  },
  {
    name: "Demo Admin",
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
        category: "Development",
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
        category: "Development",
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
      {
        title: "UI/UX Design Fundamentals",
        description:
          "Master the principles of user interface and user experience design.",
        youtubeVideoUrl: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
        language: "English",
        category: "Design",
        createdBy: trainerUser._id,
        modules: [
          {
            title: "Color Theory and Typography",
            description: "Visual design basics",
            order: 1,
          },
          {
            title: "User Research Methods",
            description: "Understanding your audience",
            order: 2,
          },
          {
            title: "Wireframing and Prototyping",
            description: "From idea to layout",
            order: 3,
          },
        ],
        quiz: [
          {
            question: "What does UI stand for?",
            options: [
              "User Interface",
              "Universal Input",
              "User Integration",
              "Unique Identity",
            ],
            correctAnswer: "User Interface",
          },
          {
            question: "Which is a key UX principle?",
            options: [
              "Maximized friction",
              "User-centered design",
              "Complex navigation",
              "Aesthetics over function",
            ],
            correctAnswer: "User-centered design",
          },
        ],
      },
      {
        title: "Business Communication Excellence",
        description:
          "Learn to communicate effectively in a professional environment.",
        youtubeVideoUrl: "https://www.youtube.com/watch?v=N4Inp2qL220",
        language: "English",
        category: "Business",
        createdBy: trainerUser._id,
        modules: [
          {
            title: "Professional Email Etiquette",
            description: "Writing clear business emails",
            order: 1,
          },
          {
            title: "Presentation Skills",
            description: "Speak with confidence",
            order: 2,
          },
          {
            title: "Effective Team Meetings",
            description: "Collaboration and leadership",
            order: 3,
          },
        ],
        quiz: [
          {
            question: "What is the goal of business communication?",
            options: [
              "To be as brief as possible",
              "To share information effectively",
              "To hide bad news",
              "To only talk to managers",
            ],
            correctAnswer: "To share information effectively",
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
