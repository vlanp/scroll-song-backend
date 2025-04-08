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
// DISCOVER
const express_1 = __importDefault(require("express"));
const isAuthenticated_1 = __importDefault(require("../middlewares/isAuthenticated"));
const Song_1 = __importDefault(require("../models/Song"));
const router = express_1.default.Router();
router.get("/discover", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return res
                .status(500)
                .json({ message: "Missing user key in the request" });
        }
        const unselectedGenres = user.unselectedGenres;
        const likedSongs = user.likedSongs;
        const dislikedSongs = user.dislikedSongs;
        const songs = yield Song_1.default.find({
            genres: { $nin: unselectedGenres },
            _id: { $nin: [...likedSongs, ...dislikedSongs] },
        });
        const response = songs.map((song) => {
            return {
                id: song._id.toString(),
                title: song.title,
                url: song.audio_url,
                start_time_excerpt_ms: song.start_time_excerpt_ms,
                end_time_excerpt_ms: song.end_time_excerpt_ms,
            };
        });
        res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post("/discover/dislike/:id", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return res
                .status(500)
                .json({ message: "Missing user key in the request" });
        }
        const id = req.params.id;
        const song = yield Song_1.default.findById(id);
        if (!song) {
            return res
                .status(404)
                .json({ message: "No song was found with this id" });
        }
        const _id = song._id;
        user.dislikedSongs.push(_id);
        yield user.save();
        res.status(201).json({ message: "Song added to disliked songs" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post("/discover/like/:id", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return res
                .status(500)
                .json({ message: "Missing user key in the request" });
        }
        const id = req.params.id;
        const song = yield Song_1.default.findById(id);
        if (!song) {
            return res
                .status(404)
                .json({ message: "No song was found with this id" });
        }
        const _id = song._id;
        user.likedSongs.push({ createdAt: new Date(), song: _id });
        yield user.save();
        res.status(201).json({ message: "Song added to liked songs" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
