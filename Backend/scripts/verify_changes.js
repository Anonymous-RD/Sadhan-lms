const mongoose = require("mongoose");
const User = require("../src/models/User");
const Course = require("../src/models/Course");
const Progress = require("../src/models/Progress");
const authController = require("../src/controllers/authController");
require("dotenv").config();

const verify = async () => {
  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/lms_demo_v0";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for verification...");

    // 1. Verify Course Categories
    const courses = await Course.find({});
    console.log(`\n--- Verifying Courses (${courses.length}) ---`);
    courses.forEach((c) => {
      console.log(`Course: ${c.title} | Category: ${c.category}`);
    });

    const missingCategory = courses.filter((c) => !c.category);
    if (missingCategory.length > 0) {
      console.error("❌ Some courses are missing categories!");
    } else {
      console.log("✅ All courses have categories.");
    }

    // 2. Verify Default Enrollment for a New User via Controller
    console.log(
      "\n--- Testing New User Registration Enrollment via Controller ---",
    );
    const testEmail = `test_controller_${Date.now()}@example.com`;

    const req = {
      body: {
        name: "Test Controller User",
        email: testEmail,
        password: "password123",
        phoneNumber: `999${Date.now().toString().slice(-7)}`,
        role: "learner",
      },
    };

    const res = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    };

    await authController.register(req, res);

    console.log(`Registration Response: ${res.statusCode}`);
    if (res.statusCode === 201) {
      const user = await User.findOne({ email: testEmail });
      const enrollments = await Progress.find({ userId: user._id });
      console.log(`User ${testEmail} has ${enrollments.length} enrollments.`);

      if (enrollments.length === 1) {
        const course = await Course.findById(enrollments[0].courseId);
        console.log(
          `✅ Success: User enrolled in exactly ONE course: ${course.title}`,
        );
      } else {
        console.error(
          `❌ Failure: Expected 1 enrollment, found ${enrollments.length}`,
        );
      }

      // Clean up
      await User.findByIdAndDelete(user._id);
      await Progress.deleteMany({ userId: user._id });
    } else {
      console.error(
        `❌ Registration failed with ${res.statusCode}: ${JSON.stringify(res.data)}`,
      );
    }

    console.log("\nCleanup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  }
};

verify();
