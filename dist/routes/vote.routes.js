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
// VOTE
const express_1 = __importDefault(require("express"));
const isAuthenticated_1 = __importDefault(require("../middlewares/isAuthenticated"));
const Song_1 = __importDefault(require("../models/Song"));
const router = express_1.default.Router();
router.get("/vote", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // Return voted songs, liked songs and tokens
        return res.status(200).json({
            votedSongs: (_a = req.user) === null || _a === void 0 ? void 0 : _a.votedSongs,
            likedSongs: (_b = req.user) === null || _b === void 0 ? void 0 : _b.likedSongs,
            tokens: (_c = req.user) === null || _c === void 0 ? void 0 : _c.tokens,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post("/vote/unvoted/:id", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve id from the request params
        const id = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Find the song in the database from id
        const song = yield Song_1.default.findById(id);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }
        // Check if song is really liked
        let likedSong = "";
        user.likedSongs.forEach((elem) => {
            if (elem.song._id.toString() === song._id.toString()) {
                likedSong = user.likedSongs.indexOf(elem).toString();
            }
        });
        if (!likedSong) {
            return res.status(404).json({ message: "Song not liked" });
        }
        else {
            user === null || user === void 0 ? void 0 : user.likedSongs.splice(Number(likedSong), 1);
        }
        yield user.save();
        return res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post("/vote/:id", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve id from the request params
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Retrieve tokens from the request body
        const tokensSent = Number(req.body.tokens);
        //Verify if user have enought tokens
        if (tokensSent > user.tokens) {
            return res.status(400).json({
                message: `You don't have enough token, you only have ${user === null || user === void 0 ? void 0 : user.tokens}`,
            });
        }
        //Verify token is not null
        if (tokensSent <= 0) {
            return res
                .status(400)
                .json({ message: `${tokensSent} is not enough...` });
        }
        // Find the song in the database from id
        const song = yield Song_1.default.findById(id).populate("artist");
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }
        // Check if song is really liked
        const likedSongsId = user.likedSongs.filter((elem) => elem.song._id.toString() === song._id.toString());
        if (likedSongsId.length === 0) {
            return res.status(404).json({ message: "Song not liked" });
        }
        user === null || user === void 0 ? void 0 : user.votedSongs.push({
            givenTokens: tokensSent,
            song: song._id,
        });
        // Delete song in likedSongs
        user === null || user === void 0 ? void 0 : user.likedSongs.splice(user === null || user === void 0 ? void 0 : user.likedSongs.indexOf(likedSongsId[0]), 1);
        // Add tokens from user to artist
        song.tokens = song.tokens + tokensSent;
        // Remove tokens used by user
        user.tokens = user.tokens - tokensSent;
        // Add artist in user if not already added
        let artistAlreadyHere = 0;
        for (let i = 0; i < (user === null || user === void 0 ? void 0 : user.artists.length); i++) {
            if ((user === null || user === void 0 ? void 0 : user.artists[i]._id.toString()) === (song === null || song === void 0 ? void 0 : song.artist._id.toString()))
                artistAlreadyHere += 1;
        }
        if (artistAlreadyHere === 0) {
            user === null || user === void 0 ? void 0 : user.artists.push(song === null || song === void 0 ? void 0 : song.artist);
        }
        // Add 50 tokens if it's first vote
        if (user.votedSongs.length === 1) {
            user.tokens = user.tokens + 50;
        }
        yield song.save();
        yield user.save();
        return res.status(200).json({
            message: "Song voted",
            firstVote: user.votedSongs.length === 1,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
