"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const songSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    genres: {
        type: [String],
        default: [],
    },
    picture_url: {
        type: String,
        required: true,
    },
    audio_url: {
        type: String,
        required: true,
    },
    start_time_excerpt_ms: {
        type: Number,
        required: true,
    },
    end_time_excerpt_ms: {
        type: Number,
        required: true,
    },
    bytes: {
        type: Number,
        required: true,
    },
    duration_ms: {
        type: Number,
        required: true,
    },
});
exports.default = mongoose_1.default.model("Song", songSchema);
