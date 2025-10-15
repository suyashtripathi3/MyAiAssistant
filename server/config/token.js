import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // load environment variables from .env

/**
 * Generate JWT token and set it as a cookie in response
 * @param {string} userId - User ID to encode in token
 * @param {object} res - Express response object
 * @returns {string} JWT token
 */
const genToken = (userId, res) => {
  const { JWT_SECRET, NODE_ENV } = process.env;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }

  // Generate token
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

  // Set cookie
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true, // prevent XSS
    sameSite: NODE_ENV === "development" ? "strict" : "none",
    secure: NODE_ENV === "development" ? false : true, // secure cookies in production
  });

  return token;
};

export default genToken;
