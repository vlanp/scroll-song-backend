// DISCOVER
import express from "express";
import isAuthenticated, {
  AuthenticatedRequest,
} from "../middlewares/isAuthenticated.js";
import { Response } from "express";
import Song from "../models/Song.js";
import { IDiscoverSong } from "../interfaces/IDiscoverSong.js";
import { isValidObjectId } from "mongoose";

const router = express.Router();

router.get(
  "/discover",
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      const unselectedGenres = user.unselectedGenres;
      const likedSongs = user.likedSongs.map((it) => it.song);
      const dislikedSongs = user.dislikedSongs;

      const songs = await Song.find({
        genres: { $nin: unselectedGenres },
        _id: { $nin: [...likedSongs, ...dislikedSongs] },
      });

      const response: Array<IDiscoverSong> = songs.map((song) => {
        return {
          id: song._id.toString(),
          title: song.title,
          artist: song.artist,
          genres: song.genres,
          sourceUrl: song.sourceUrl,
          pictureUrl: song.pictureUrl,
          audioUrl: song.audioUrl,
          startTimeExcerptMs: song.startTimeExcerptMs,
          endTimeExcerptMs: song.endTimeExcerptMs,
        };
      });

      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/discover/dislike/:id",
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      const id = req.params.id;

      if (!isValidObjectId(id)) {
        return res
          .status(400)
          .json({ message: "The provided id is not a valid id" });
      }

      const song = await Song.findById(id);
      if (!song) {
        return res
          .status(404)
          .json({ message: "No song was found with this id" });
      }

      user.dislikedSongs.push(song);

      await user.save();

      res.status(201).json({ message: "Song added to disliked songs" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/discover/like/:id",
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      const id = req.params.id;

      if (!isValidObjectId(id)) {
        return res
          .status(400)
          .json({ message: "The provided id is not a valid id" });
      }

      const song = await Song.findById(id);
      if (!song) {
        return res
          .status(404)
          .json({ message: "No song was found with this id" });
      }

      user.likedSongs.push({ createdAt: new Date(), song });

      await user.save();

      res.status(201).json({ message: "Song added to liked songs" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
