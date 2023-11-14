import mongoose from "mongoose";
import jwt from "jsonwebtoken";
// define schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlenngth: 32,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: {
    type: String,
    default: null, // Initial value is null
  },
});

const User = mongoose.model("user", userSchema);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY);
};
export { User, generateToken };
