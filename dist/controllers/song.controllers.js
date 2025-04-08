import { saveSongUtils } from "./utils/song.utils.js";
export const saveSongController = async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).json({ message: "No files found in the request" });
        }
        if (!req.files.audio) {
            return res.status(400).json({ message: "No audio found in the request" });
        }
        let audios = req.files.audio;
        !Array.isArray(audios) && (audios = [audios]);
        const savePromises = audios.map((audio) => {
            return saveSongUtils(audio);
        });
        const result = await Promise.all(savePromises);
        const success = result.filter((res) => res === true);
        res.status(201).json({
            message: `${success.length} songs saved successfully over ${audios.length} files`,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
