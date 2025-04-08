require("dotenv").config();
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import adminSongRouter from "./routes/admin_routes/song.routes";
import discoverRouter from "./routes/discover.routes";
import userRouter from "./routes/user.routes";

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
app.use(adminSongRouter);

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
