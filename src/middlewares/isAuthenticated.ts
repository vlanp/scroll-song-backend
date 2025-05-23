import { NextFunction, Request, Response } from "express";
import { Document, MergeType, Types } from "mongoose";
import User, { IUser } from "../models/User.js";
import { ISong } from "../models/Song.js";
import { IMongoose } from "../interfaces/IMongoose.js";

type IMongoosePopulatedUser = MergeType<
  IMongoose<IUser>,
  {
    dislikedSongs: IMongoose<ISong>[];
    likedSongs: IMongoose<{
      song: IMongoose<ISong>;
      createdAt: Date;
    }>[];
  }
>;

export interface AuthenticatedRequest extends Request {
  user: Document<unknown, {}, IMongoosePopulatedUser> & IMongoosePopulatedUser;
}

export default async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const user = await User.findOne({ authToken: token })
      .populate<{ dislikedSongs: IMongoose<ISong>[] }>("dislikedSongs")
      .populate<{
        likedSongs: IMongoose<{
          song: IMongoose<ISong>;
          createdAt: Date;
        }>[];
      }>("likedSongs.song");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
