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
exports.default = isAuthenticated;
const User_1 = __importDefault(require("../models/User"));
function isAuthenticated(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
            const user = yield User_1.default.findOne({ authToken: token }).populate([
                "dislikedSongs",
                "likedSongs.song",
                "votedSongs.song",
                "artists",
                "badges.badge",
            ]);
            yield (user === null || user === void 0 ? void 0 : user.populate("likedSongs.song.artist", "votedSongs.song.artist"));
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            req.user = user;
            next();
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}
