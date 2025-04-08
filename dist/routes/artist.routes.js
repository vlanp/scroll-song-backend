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
// ARTIST
const express_1 = __importDefault(require("express"));
const isAuthenticated_1 = __importDefault(require("../middlewares/isAuthenticated"));
const Artist_1 = __importDefault(require("../models/Artist"));
const Song_1 = __importDefault(require("../models/Song"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
const tokenToMoneyConversion = 0.005;
router.get("/artist/:id", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const artist = yield Artist_1.default.findById(id).populate("songs");
        if (!artist) {
            return res
                .status(404)
                .json({ message: "No artist found with this id" });
        }
        res.status(200).json(artist);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post("/artist/:id", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const tokens = Number(req.body.tokens);
        const artist = yield Artist_1.default.findById(id);
        const user = yield User_1.default.findById(req.user);
        if (!artist) {
            return res
                .status(404)
                .json({ message: "No artist found with this id" });
        }
        if (!user) {
            return res
                .status(404)
                .json({ message: "No user found with this id" });
        }
        if (!tokens) {
            return res
                .status(404)
                .json({ message: "No tokens found" });
        }
        if (tokens > user.tokens) {
            return res
                .status(404)
                .json({ message: "You don't have enough tokens" });
        }
        artist.tokens = artist.tokens + tokens;
        user.tokens = user.tokens - tokens;
        artist.save();
        user.save();
        res.status(200).json(artist);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
/**
 * @todo To test when PaulG will have done the vote route
 */
router.get("/artists/earned", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return res
                .status(500)
                .json({ message: "Missing user key in the request" });
        }
        // Songs are not populated => Fill an array with songs promises in order to get all songs from mongodb in parallel
        const arrayOfPromises = [];
        user.votedSongs.forEach((votedSong) => {
            arrayOfPromises.push(Song_1.default.findById(votedSong.song));
        });
        // Wait for all promises to complete
        const populatedVotedSongs = yield Promise.all(arrayOfPromises);
        // Create an array of object relating id of artists with the number of tokens they earned from the authenticated user
        const artistsTokensEarned = [];
        user.votedSongs.forEach((votedSong, index) => {
            var _a;
            // Since Promise.all keep the order of the elements in the array, we can retrieve the artist from the index
            const artist = (_a = populatedVotedSongs[index]) === null || _a === void 0 ? void 0 : _a.artist;
            let artistIndex = -1;
            // Search if the artist is already within the array. If it is, retrieve the index.
            const filteredArtistsTokensEarned = artistsTokensEarned.filter((artistEarned, _index) => {
                if (artistEarned.artist === (artist === null || artist === void 0 ? void 0 : artist._id.toString())) {
                    artistIndex = _index;
                    return true;
                }
            });
            // If the filtered array is not empty, it means that the artist is in the array at the specified index. Tokens number is then updated
            if (filteredArtistsTokensEarned.length !== 0) {
                artistsTokensEarned[artistIndex].tokenEarned += votedSong.givenTokens;
                // Other way, the artist id added in the array with the number of Tokens given by the authenticated user
            }
            else {
                artist &&
                    artistsTokensEarned.push({
                        artist: artist === null || artist === void 0 ? void 0 : artist._id.toString(),
                        tokenEarned: votedSong.givenTokens,
                    });
            }
        });
        // Convert tokens into money
        const artistMoneyEarned = artistsTokensEarned.map((artistTokensEarned) => {
            return {
                artist: artistTokensEarned.artist,
                moneyEarned: artistTokensEarned.tokenEarned * tokenToMoneyConversion,
            };
        });
        res.status(200).json(artistMoneyEarned);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
