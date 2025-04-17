import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import adminSongRouter from "./routes/admin_routes/song.routes.js";
import discoverRouter from "./routes/discover.routes.js";
import genresRouter from "./routes/genres.routes.js";
import userRouter from "./routes/user.routes.js";
import "./utils/array.js";
dotenv.config();
const app = express();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
});
mongoose.connect(process.env.MONGODB_URI || "");
app.use(express.json());
app.use(cors());
app.use(userRouter);
app.use(discoverRouter);
app.use(genresRouter);
app.use(adminSongRouter);
app.all("*", (_req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
