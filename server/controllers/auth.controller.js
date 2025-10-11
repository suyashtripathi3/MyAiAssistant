import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Detect environment
const isProd = process.env.NODE_ENV === "production";

// ==================== SIGNUP ====================
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Debug: measure hash time
    console.time("hashPassword");
    const hashPassword = await bcrypt.hash(password, 10);
    console.timeEnd("hashPassword");

    // Debug: measure DB create time
    console.time("createUser");
    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });
    console.timeEnd("createUser");

    // Generate JWT token
    const token = await genToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Signup error", error });
  }
};

// ==================== SIGNIN ====================
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email doesn't exist" });
    }

    // Check password
    console.time("comparePassword");
    const isMatch = await bcrypt.compare(password, user.password);
    console.timeEnd("comparePassword");

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate token
    const token = await genToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Signin error", error });
  }
};

// ==================== LOGOUT ====================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout error", error });
  }
};
