"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const artistSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    banner_url: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    socials: {
        instagram: {
            type: String,
            default: "",
        },
        spotify: {
            type: String,
            default: "",
        },
        deezer: {
            type: String,
            default: "",
        },
        facebook: {
            type: String,
            default: "",
        },
        twitter: {
            type: String,
            default: "",
        },
        website: {
            type: String,
            default: "",
        },
    },
    songs: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Song",
        },
    ],
    votes: {
        type: Number,
        default: 0,
    },
    tokens: {
        type: Number,
        default: 0,
    },
});
exports.default = mongoose_1.default.model("Artist", artistSchema);
