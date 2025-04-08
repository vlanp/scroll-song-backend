import express from "express";
import isAdmin from "../../middlewares/isAdmin.js";
import fileUpload from "express-fileupload";
import { saveSongController } from "../../controllers/song.controllers.js";

const router = express.Router();

/**
 * List of all parameters for the request:
 * @formdata @param audio: One or multiple audio files
 */
router.post("/admin/songs", isAdmin, fileUpload(), saveSongController);

export default router;
