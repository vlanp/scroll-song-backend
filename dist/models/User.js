import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
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
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Song",
    },
    likedSongs: {
        type: [
            {
                song: {
                    type: mongoose.Schema.Types.ObjectId,
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
export default mongoose.model("User", userSchema);
