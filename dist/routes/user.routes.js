import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import express from "express";
import fileUpload from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import uid2 from "uid2";
import { passwordStrength } from "check-password-strength";
const router = express.Router();
router.get("/user", isAuthenticated, (req, res) => {
    try {
        //create an object without the password and the token
        const user = {
            username: req.user.username,
            email: req.user.email,
            avatar: req.user.avatar,
            genres: req.user.unselectedGenres,
            dislikedSongs: req.user.dislikedSongs,
            likedSongs: req.user.likedSongs,
        };
        res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/user/login", async (req, res) => {
    try {
        // Retrieve email and password from the request body
        const { email, password } = req.body;
        //Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Find the user in the database by email
        const user = await User.findOne({ email });
        // If the user is not found, return an error response
        if (!user) {
            return res.status(404).json({ message: "Invalid email or password" });
        }
        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        // If the passwords do not match, return an error response
        if (!passwordMatch) {
            return res.status(404).json({ message: "Invalid email or password" });
        }
        // Return a response with the user's ID and the new token
        res.status(200).json({ id: user._id, token: user.authToken });
    }
    catch (error) {
        console.log(error); // Log the error to the console
        res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/user/signup", fileUpload(), async (req, res) => {
    // Destructure email, username, password, and avatar from the request body
    const { email, username, password, } = req.body;
    try {
        // Check if email, username and passwords are provided
        if (!email || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Check if email already exists in the database
        const user = await User.findOne({ email });
        if (user) {
            // If user already exists, return an error response
            return res.status(409).json({ message: "User already exists" });
        }
        if (passwordStrength(password).id !== 3) {
            return res.status(406).json({ message: "Password must be strong" });
        }
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        // Generate a new authentication token
        const authToken = uuidv4();
        // Initialize avatar_url as an empty string
        let avatar_url = "";
        // If there are files in the request and the avatar is not an array
        if (req.files && !Array.isArray(req.files.avatar)) {
            const file = req.files.avatar;
            // Convert the file to a base64 string
            const imageBase64 = `data:${file.mimetype};base64,${file.data.toString("base64")}`;
            // Upload the image to Cloudinary and get the secure URL
            const result = await cloudinary.uploader.upload(imageBase64, {
                folder: "avatars",
            });
            avatar_url = result.secure_url;
        }
        const unselectedGenres = [];
        const randomString = uid2(8);
        await sendEmail(email, "Email verification - Scroll Song App", "Here is the code to enter in the application : \n" + randomString);
        // Create a new user object with the provided, and generated data
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            avatar: avatar_url || "",
            authToken,
            unselectedGenres: unselectedGenres,
            dislikedSongs: [],
            likedSongs: [],
            verifString: randomString,
            verifValidUntil: new Date(Date.now() + 60000),
            isActivated: false,
        });
        // Save the new user to the database
        await newUser.save();
        res.status(201).json({ email });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/user/mailcheck/:randomString", async (req, res) => {
    try {
        const email = req.query.email;
        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "Email is missing" });
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res
                .status(404)
                .json({ message: "No User found with the provided email" });
        }
        if (user.isActivated) {
            return res.status(400).json({ message: "Accound already activated" });
        }
        const randomString = req.params.randomString;
        if (randomString !== user.verifString) {
            return res.status(406).json({
                message: "The verification string does not correspond to the provided email",
            });
        }
        if (user.verifValidUntil < new Date()) {
            return res.status(403).json({
                message: "The verification string has expired",
            });
        }
        user.isActivated = true;
        await user.save();
        res.status(200).json({ id: user._id, token: user.authToken, email });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/user/askresetpw", async (req, res) => {
    try {
        const email = req.query.email;
        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "Email is missing" });
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res
                .status(404)
                .json({ message: "No User found with the provided email" });
        }
        const randomString = uid2(8);
        await sendEmail(email, "Reset password - Scroll Song App", "Here is the code to enter in the application : \n" + randomString);
        user.resetPWString = randomString;
        user.resetPWValidUntil = new Date(Date.now() + 60000);
        await user.save();
        res.status(202).json({ email });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/user/resetpw/:randomString", async (req, res) => {
    try {
        const email = req.query.email;
        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "Email is missing" });
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res
                .status(404)
                .json({ message: "No User found with the provided email" });
        }
        const randomString = req.params.randomString;
        if (randomString !== user.resetPWString) {
            return res.status(406).json({
                message: "The verification string does not correspond to the provided email",
            });
        }
        if (user.resetPWValidUntil < new Date()) {
            return res.status(403).json({
                message: "The verification string has expired",
            });
        }
        user.isActivated = true;
        await user.save();
        res.status(202).json({ id: user._id, token: user.authToken, email });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/user/resetpw", isAuthenticated, async (req, res) => {
    try {
        const newPassword = req.body.newPassword;
        if (!newPassword) {
            res.status(400).json({ message: "newPassword is missing" });
        }
        if (passwordStrength(newPassword).id !== 3) {
            return res.status(406).json({ message: "NewPassword must be strong" });
        }
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Generate a new authentication token
        const authToken = uuidv4();
        const user = req.user;
        user.password = hashedPassword;
        user.authToken = authToken;
        await user.save();
        res
            .status(202)
            .json({ id: user._id, token: user.authToken, email: user.email });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/user/updateGenres", isAuthenticated, async (req, res) => {
    try {
        // Get the user from the request
        const user = req.user;
        // Get the genres from the request body
        const { unselectedGenres } = req.body;
        // If genres are not provided, return a 400 status with an error message
        if (!unselectedGenres) {
            return res
                .status(400)
                .json({ message: "Unselected genres are required" });
        }
        if (!Array.isArray(unselectedGenres) ||
            !unselectedGenres.every((genre) => typeof genre === "string")) {
            return res
                .status(400)
                .json({ message: "Unselected genres must be an array of string" });
        }
        // If no user is found, return a 400 status with an error message
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        // Update the user's genres
        user.unselectedGenres = unselectedGenres;
        // Save the updated user
        await user.save();
        // Return a 200 status with a success message
        res.status(200).json({ message: "Genres updated successfully" });
    }
    catch (error) {
        // Log the error and return a 500 status with an error message
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
export default router;
