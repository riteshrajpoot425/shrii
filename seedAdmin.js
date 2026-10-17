require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be present in .env");
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

    if (existingAdmin) {
      console.log("Admin already exists.");
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      name: "Shri Automobile Admin",
      email: email.toLowerCase(),
      password: hashedPassword
    });

    console.log("Admin created successfully.");
    console.log(`Login email: ${email}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exit(1);
  }
}

createAdmin();
