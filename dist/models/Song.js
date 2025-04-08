import mongoose from "mongoose";
const songSchema = new mongoose.Schema({
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
export default mongoose.model("Song", songSchema);
