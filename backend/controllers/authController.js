import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, userType } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "user already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password:hashedPassword,
      userType: userType || "jobseeker",
    });
    await user.save();

    res.status(201).json({
      message: "user registered successfully",
      user: {
        id: user._id,
        fistName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        userType: userType,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "invalid email",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "wrong password",
      });
    }
    res.status(200).json({
      message: "Login successful",

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};
