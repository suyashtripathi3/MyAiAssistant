import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import genToken from "../config/token.js";

// ==================== SIGNUP ====================
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existEmail = await User.findOne({ email });
    if (existEmail)
      return res.status(400).json({ message: "Email already exists" });

    // Validate password length
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ name, email, password: hashPassword });

    // Generate token & set cookie
    genToken(user._id, res);

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
    if (!user) return res.status(400).json({ message: "Email doesn't exist" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    // Generate token & set cookie
    genToken(user._id, res);

    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Signin error", error });
  }
};

// ==================== LOGOUT ====================
export const logout = async (req, res) => {
  try {
    // Clear JWT cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
      secure: process.env.NODE_ENV === "development" ? false : true,
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout error", error });
  }
};
