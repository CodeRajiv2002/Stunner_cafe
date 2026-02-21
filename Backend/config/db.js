// config/db.js
import mongoose from "mongoose";

export const connectDB = () => {
  // We return the promise here
  return mongoose
    .connect(`${process.env.MONGO_URI}/stunner_cafe`)
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    })
    .catch((error) => {
      console.error(`Database connection failed: ${error.message}`);
      process.exit(1);
    });
};
