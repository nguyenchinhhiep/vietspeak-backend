const mongoose = require("mongoose");
const configs = process.env;

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(String(configs.MONGO_URL));
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
