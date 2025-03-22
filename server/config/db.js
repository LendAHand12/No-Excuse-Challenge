import mongoose from "mongoose";

// connect to the mongoDB collection
const connectDB = () => {
  var connectionString =
    process.env.MONGO_URI;
  mongoose
    .connect(connectionString, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then((res) => console.log(`MongoDB Connected: ${res.connection.host}`))
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
};

export default connectDB;
