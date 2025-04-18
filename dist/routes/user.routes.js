import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import express from "express";
import fileUpload from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import User from "../models/User.js";
const router = express.Router();
router.get("/user", isAuthenticated, (req, res) => {
    try {
        //create an object without the password and the token
        const user = {
            username: req.user?.username || "",
            email: req.user?.email || "",
            avatar: req.user?.avatar || "",
            genres: req.user?.unselectedGenres || [],
            dislikedSongs: req.user?.dislikedSongs || [],
            likedSongs: req.user?.likedSongs || [],
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
            return res.status(400).json({ message: "User already exists" });
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
        });
        // Save the new user to the database
        await newUser.save();
        // Return a response with the new user's ID and authentication token
        res.status(200).json({ id: newUser._id, token: newUser.authToken });
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
