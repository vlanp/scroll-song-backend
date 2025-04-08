"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const cloudinary_1 = require("cloudinary");
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const uuid_1 = require("uuid");
const isAuthenticated_1 = __importDefault(require("../middlewares/isAuthenticated"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.get("/user", isAuthenticated_1.default, (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    try {
        //create an object without the password and the token
        const user = {
            username: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.username) || "",
            email: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.email) || "",
            avatar: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.avatar) || "",
            genres: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.unselectedGenres) || [],
            dislikedSongs: ((_e = req.user) === null || _e === void 0 ? void 0 : _e.dislikedSongs) || [],
            likedSongs: ((_f = req.user) === null || _f === void 0 ? void 0 : _f.likedSongs) || [],
        };
        res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/user/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve email and password from the request body
        const { email, password } = req.body;
        //Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Find the user in the database by email
        const user = yield User_1.default.findOne({ email });
        // If the user is not found, return an error response
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        // Compare the provided password with the stored hashed password
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        // If the passwords do not match, return an error response
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }
        // Return a response with the user's ID and the new token
        res.status(200).json({ id: user._id, token: user.authToken });
    }
    catch (error) {
        console.log(error); // Log the error to the console
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post("/user/signup", (0, express_fileupload_1.default)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Destructure email, username, password, and avatar from the request body
    const { email, username, password, } = req.body;
    try {
        // Check if email, username and passwords are provided
        if (!email || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Check if email already exists in the database
        const user = yield User_1.default.findOne({ email });
        if (user) {
            // If user already exists, return an error response
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash the password using bcrypt
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Generate a new authentication token
        const authToken = (0, uuid_1.v4)();
        // Initialize avatar_url as an empty string
        let avatar_url = "";
        // If there are files in the request and the avatar is not an array
        if (req.files && !Array.isArray(req.files.avatar)) {
            const file = req.files.avatar;
            // Convert the file to a base64 string
            const imageBase64 = `data:${file.mimetype};base64,${file.data.toString("base64")}`;
            // Upload the image to Cloudinary and get the secure URL
            const result = yield cloudinary_1.v2.uploader.upload(imageBase64, {
                folder: "avatars",
            });
            avatar_url = result.secure_url;
        }
        const unselectedGenres = [];
        // Create a new user object with the provided, and generated data
        const newUser = new User_1.default({
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
        yield newUser.save();
        // Return a response with the new user's ID and authentication token
        res.status(200).json({ id: newUser._id, token: newUser.authToken });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.put("/user/updateGenres", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield user.save();
        // Return a 200 status with a success message
        res.status(200).json({ message: "Genres updated successfully" });
    }
    catch (error) {
        // Log the error and return a 500 status with an error message
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
