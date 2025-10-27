import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // load environment variables from .env

const genToken = (userId, res) => {
  const { JWT_SECRET, NODE_ENV } = process.env;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }

  // Generate token
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

  // Set cookie
  // genToken.js
  res.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    secure: process.env.NODE_ENV === "development" ? false : true,
  });

  return token;
};

export default genToken;
