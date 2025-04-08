"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAdmin_1 = __importDefault(require("../../middlewares/isAdmin"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const song_controllers_1 = require("../../controllers/song.controllers");
const router = express_1.default.Router();
/**
 * List of all parameters for the request:
 * @formdata @param audio: One or multiple audio files
 */
router.post("/admin/songs", isAdmin_1.default, (0, express_fileupload_1.default)(), song_controllers_1.saveSongController);
exports.default = router;
