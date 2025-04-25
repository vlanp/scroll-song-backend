import express from "express";
import isAuthenticated, {
  AuthenticatedRequest,
} from "../middlewares/isAuthenticated.js";
import { Response } from "express";
import { ILikedSong } from "../interfaces/ILikedSong.js";

const router = express.Router();

router.get(
  "/favorites",
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      const response: Array<ILikedSong> = user.likedSongs.map((likedSong) => {
        const song = likedSong.song;
        return {
          id: song._id.toString(),
          title: song.title,
          artist: song.artist,
          genres: song.genres,
          sourceUrl: song.sourceUrl,
          pictureUrl: song.pictureUrl,
          audioUrl: song.audioUrl,
          durationMs: song.durationMs,
        };
      });

      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
