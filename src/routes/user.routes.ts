import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import express, { Request, Response } from "express";
import fileUpload from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import isAuthenticated, {
  AuthenticatedRequest,
} from "../middlewares/isAuthenticated.js";
import User, { IUser } from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import { passwordStrength } from "check-password-strength";
import crypto from "crypto";

const router = express.Router();

router.get(
  "/user",
  isAuthenticated,
  (req: AuthenticatedRequest, res: Response) => {
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
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post("/user/login", async (req: Request, res: Response) => {
  try {
    // Retrieve email and password from the request body
    const { email, password }: { email: string; password: string } = req.body;

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

    if (!user.isActivated) {
      const verifCode = crypto.randomInt(99999999);

      await sendEmail(
        email,
        "Email verification - Scroll Song App",
        "Here is the code to enter in the application : \n" + verifCode
      );

      const verifValidUntil = new Date(Date.now() + 60000);

      user.verifCode = verifCode;
      user.verifValidUntil = verifValidUntil;

      await user.save();

      return res.status(200).json({ email, validUntil: verifValidUntil });
    }

    // Return a response with the user's ID and the new token
    res.status(200).json({ id: user._id, token: user.authToken });
  } catch (error) {
    console.log(error); // Log the error to the console
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/user/signup",
  fileUpload(),
  async (req: Request, res: Response) => {
    // Destructure email, username, password, and avatar from the request body
    const {
      email,
      username,
      password,
    }: { email: string; username: string; password: string } = req.body;

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
        const imageBase64 = `data:${file.mimetype};base64,${file.data.toString(
          "base64"
        )}`;

        // Upload the image to Cloudinary and get the secure URL
        const result = await cloudinary.uploader.upload(imageBase64, {
          folder: "avatars",
        });
        avatar_url = result.secure_url;
      }

      const unselectedGenres: string[] = [];

      const verifCode = crypto.randomInt(99999999);

      await sendEmail(
        email,
        "Email verification - Scroll Song App",
        "Here is the code to enter in the application : \n" + verifCode
      );

      const verifValidUntil = new Date(Date.now() + 60000);

      // Create a new user object with the provided, and generated data
      const newUser = new User<IUser>({
        username,
        email,
        password: hashedPassword,
        avatar: avatar_url || "",
        authToken,
        unselectedGenres: unselectedGenres,
        dislikedSongs: [],
        likedSongs: [],
        verifCode: verifCode,
        verifValidUntil,
        isActivated: false,
      });

      // Save the new user to the database
      await newUser.save();

      res.status(201).json({ email, validUntil: verifValidUntil });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/user/mailcheck/:verifCode",
  async (req: Request, res: Response) => {
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

      const verifCode = req.params.verifCode;

      if (verifCode !== user.verifCode.toString()) {
        return res.status(406).json({
          message:
            "The verification code does not correspond to the provided email",
        });
      }

      if (user.verifValidUntil < new Date()) {
        return res.status(403).json({
          message: "The verification code has expired",
        });
      }

      user.isActivated = true;

      await user.save();

      res.status(200).json({ id: user._id, token: user.authToken, email });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/user/mailcheck", async (req: Request, res: Response) => {
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

    const verifCode = crypto.randomInt(99999999);

    await sendEmail(
      email,
      "Email verification - Scroll Song App",
      "Here is the code to enter in the application : \n" + verifCode
    );

    user.verifCode = verifCode;
    const verifValidUntil = new Date(Date.now() + 60000);
    user.verifValidUntil = verifValidUntil;

    await user.save();

    res.status(202).json({ email, validUntil: verifValidUntil });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user/askresetpw", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    let user = await User.findOne({ authToken: token });

    let email: string;

    if (user) {
      email = user.email;
    } else {
      if (!req.query.email || typeof req.query.email !== "string") {
        return res.status(400).json({ message: "Email is missing" });
      } else {
        email = req.query.email;
      }

      user = await User.findOne({ email: email });

      if (!user) {
        return res
          .status(404)
          .json({ message: "No User found with the provided email" });
      }
    }

    const verifCode = crypto.randomInt(99999999);

    await sendEmail(
      email,
      "Reset password - Scroll Song App",
      "Here is the code to enter in the application : \n" + verifCode
    );

    user.resetPWCode = verifCode;
    const resetPWValidUntil = new Date(Date.now() + 60000);
    user.resetPWValidUntil = resetPWValidUntil;

    await user.save();

    res.status(202).json({ email, validUntil: resetPWValidUntil });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user/resetpw/:verifCode", async (req: Request, res: Response) => {
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

    const verifCode = req.params.verifCode;

    if (verifCode !== user.resetPWCode.toString()) {
      return res.status(406).json({
        message:
          "The verification code does not correspond to the provided email",
      });
    }

    if (user.resetPWValidUntil < new Date()) {
      return res.status(403).json({
        message: "The verification code has expired",
      });
    }

    user.isActivated = true;

    user.resetPWUntil = new Date(Date.now() + 300000);

    await user.save();

    res.status(202).json({ id: user._id, token: user.authToken, email });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put(
  "/user/resetpw",
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      if (user.resetPWUntil < new Date()) {
        return res.status(403).json({
          message:
            "The delay to change the password has been exceeded. Please ask a new code.",
        });
      }

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

      user.password = hashedPassword;
      user.authToken = authToken;

      await user.save();

      res
        .status(202)
        .json({ id: user._id, token: user.authToken, email: user.email });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.put(
  "/user/updateGenres",
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
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
      if (
        !Array.isArray(unselectedGenres) ||
        !unselectedGenres.every((genre) => typeof genre === "string")
      ) {
        return res
          .status(400)
          .json({ message: "Unselected genres must be an array of string" });
      }
      // Update the user's genres
      user.unselectedGenres = unselectedGenres;
      // Save the updated user
      await user.save();
      // Return a 200 status with a success message
      res.status(200).json({ message: "Genres updated successfully" });
    } catch (error) {
      // Log the error and return a 500 status with an error message
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
