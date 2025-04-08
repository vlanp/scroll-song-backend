import { Request, Response } from "express";
import { saveSongUtils } from "./utils/song.utils.js";

export const saveSongController = async (req: Request, res: Response) => {
  try {
    const sourceUrl = req.body.sourceUrl;

    if (!sourceUrl) {
      return res
        .status(400)
        .json({ message: "Missing sourceUrl in the request" });
    }

    if (!req.files) {
      return res.status(400).json({ message: "No files found in the request" });
    }

    if (!req.files.audios) {
      return res
        .status(400)
        .json({ message: "No audios found in the request" });
    }

    if (!req.files.pictures) {
      return res
        .status(400)
        .json({ message: "No picture found in the request" });
    }

    let audios = req.files.audios;

    !Array.isArray(audios) && (audios = [audios]);

    let pictures = req.files.pictures;

    !Array.isArray(pictures) && (pictures = [pictures]);

    if (audios.length !== pictures.length) {
      return res.status(400).json({
        message: "The number of audio files and picture files must be the same",
      });
    }

    const savePromises = audios.map((audio) => {
      return saveSongUtils(audio, pictures[audios.indexOf(audio)], sourceUrl);
    });

    const result = await Promise.all(savePromises);

    const success = result.filter((res) => res === true);

    res.status(201).json({
      message: `${success.length} songs saved successfully over ${audios.length} files`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
