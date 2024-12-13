import dotenv from "dotenv";
import users from "./data/users.js";
import User from "./models/userModel.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // delete all the current data in all three collections
    await User.deleteMany();

    await User.insertMany(users);

    console.log("Data inserted in to the DB");
    process.exit();
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};

const destroyData = async () => {
  try {
    // delete all the current data in all three collections
    await User.deleteMany();

    console.log("Data deleted from the DB");
    process.exit();
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};

// check the npm flag and call appropriate function
if (process.argv[2] === "-d") destroyData();
else importData();
