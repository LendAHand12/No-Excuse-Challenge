import dotenv from "dotenv";
dotenv.config();
import connectDB from "../config/db.js";
import Admin from "../models/adminModel.js";

const createRootAdmin = async () => {
  try {
    await connectDB();

    // Check if root admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin1@gmail.com" });
    if (existingAdmin) {
      console.log("Root admin already exists!");
      process.exit(0);
    }

    // Create root admin
    const rootAdmin = await Admin.create({
      email: "admin1@gmail.com",
      password: "Pierre@@1968", // Will be hashed by pre-save hook
      isRootAdmin: true,
      firstLoginCompleted: false,
      faceRegistered: false,
      googleAuthenticatorEnabled: false,
      isActive: true,
    });

    console.log("Root admin created successfully!");
    console.log("Email:", rootAdmin.email);
    console.log("Password: Pierre@@1968");
    console.log("Please complete first-time setup (face registration and 2FA) on first login.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating root admin:", error);
    process.exit(1);
  }
};

createRootAdmin();
