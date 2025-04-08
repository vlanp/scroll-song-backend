"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    authToken: {
        type: String,
        required: true,
    },
    unselectedGenres: {
        type: [String],
    },
    dislikedSongs: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Song",
    },
    likedSongs: {
        type: [
            {
                song: {
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    ref: "Song",
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
});
exports.default = mongoose_1.default.model("User", userSchema);
