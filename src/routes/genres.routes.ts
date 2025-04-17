import express, { Response } from "express";
import isAuthenticated, {
  AuthenticatedRequest,
} from "../middlewares/isAuthenticated.js";
import Song from "../models/Song.js";

const router = express.Router();

router.get(
  "/genres",
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res
          .status(500)
          .json({ message: "Missing user key in the request" });
      }

      const songs = await Song.find();

      const genres = songs.flatMap((songs) => songs.genres).distinct();

      res.status(200).json(genres);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
