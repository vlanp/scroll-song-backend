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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Song_1 = __importDefault(require("../../models/Song"));
const isAuthenticated_1 = __importDefault(require("../../middlewares/isAuthenticated"));
const mongoose_1 = require("mongoose");
const router = express_1.default.Router();
router.post("/dev/song", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, artist, genres, picture_url, audio_url, tokens } = req.body;
    const newSong = new Song_1.default({
        title,
        artist,
        genres,
        picture_url,
        audio_url,
        tokens,
    });
    yield newSong.save();
    res.status(201).json({ message: "Musique créée en base de donnée" });
}));
router.post("/dev/votedSong/:id", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const id = req.params.id;
    if (!user) {
        return;
    }
    const { tokens } = req.body;
    const _id = new mongoose_1.Types.ObjectId(id);
    user.votedSongs.push({
        song: _id,
        givenTokens: tokens,
    });
    yield user.save();
    res.status(201).json({ message: "ok" });
}));
exports.default = router;
