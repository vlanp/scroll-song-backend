"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSongController = void 0;
const song_utils_1 = require("./utils/song.utils");
const saveSongController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            return (0, song_utils_1.saveSongUtils)(audio);
        });
        const result = yield Promise.all(savePromises);
        const success = result.every((res) => res === true);
        res.status(201).json({
            message: `${success} songs saved successfully over ${audios.length} files`,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.saveSongController = saveSongController;
