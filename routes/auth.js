const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const {
  validateName,
  validateEmail,
  validatePassword,
} = require("../utils/validators");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: INTEGER
 *           description: The auto-generated id of the user
 *         name:
 *           type: STRING
 *           description: The name of the user
 *         email:
 *           type: STRING
 *           description: The email of the user
 *         password:
 *           type: STRING
 *           description: The password of the user
 *       example:
 *         name: Ritesh
 *         email: riteshk@gmail.com
 *         password: Ritesh@7
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *    post:
 *     summary: Create a new user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user was successfully created
 *       403:
 *         description: There was already an existing user with the same email
 *       400:
 *         description: Validation failed for the name, email or password
 *       500:
 *         description: Some server error
 */

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(403).json({ err: "User already exists" });
    }

    if (!validateName(name)) {
      return res.status(400).json({
        err: "Invalid user name: name must be longer than two characters and must not include any numbers or special characters",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ err: "Error: Invalid email" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        err: "Error: Invalid password: password must be at least 8 characters long and must include atleast one - one uppercase letter, one lowercase letter, one digit, one special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, (saltOrRounds = 10));
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    const createdUser = await user.save();

    return res.status(200).json({
      message: `Account Created Successfully Thank you for signing up`,
      user: createdUser,
    });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

/**
 * @swagger
 * /api/v1/auth/signin:
 *    post:
 *     summary: Login Existing User
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the User
 *               password:
 *                 type: string
 *                 description: Password of the User
 *           example:
 *              email: riteshk@gmail.com
 *              password: Ritesh@7
 *     responses:
 *       200:
 *         description: The user logged in Succesfully
 *       403:
 *         description: No user Exist with the given Mail
 *       401:
 *         description: Validation failed for the name, email or password
 *       500:
 *         description: Some server error
 */

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email.length === 0) {
      return res.status(400).json({ err: "Please enter your email" });
    }
    if (password.length === 0) {
      return res.status(400).json({ err: "Please enter your password" });
    }

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(403).json("Error: User not found");
    }

    const passwordMatched = await bcrypt.compare(
      password,
      existingUser.password
    );
    console.log(passwordMatched + "+++>");
    if (!passwordMatched) {
      return res.status(400).send({
        message: "Email or Password is Incorrect!",
      });
    }

    const payload = { user: { id: existingUser._id } };
    const bearerToken = await jwt.sign(payload, process.env.secret, {
      expiresIn: 360000,
    });

    res.cookie("token", bearerToken, { expire: new Date() + 360000 });

    console.log("Logged in successfully");

    return res
      .status(200)
      .json({ message: "Signed In Successfully!", bearerToken: bearerToken });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err.message });
  }
});

/**
 * @swagger
 * /api/v1/auth/signout:
 *    get:
 *     summary: Sign in out the user
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       500:
 *         description: Some server error
 */
router.get("/signout", async (_req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: err.message });
  }
});

module.exports = router;
