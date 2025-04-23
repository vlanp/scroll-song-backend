import express, { Response } from "express";
import isAuthenticated, {
  AuthenticatedRequest,
} from "../middlewares/isAuthenticated.js";
import Song from "../models/Song.js";
import IGenreState from "../interfaces/IGenreState.js";

const router = express.Router();

router.get(
  "/genres",
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      const songs = await Song.find();

      const genres = songs.flatMap((songs) => songs.genres).distinct();

      const genresStates: IGenreState[] = genres.map((genre) => ({
        genre,
        isSelected: genre! in user.unselectedGenres,
      }));

      res.status(200).json(genresStates);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
