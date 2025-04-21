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
        required: false,
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
    verifString: {
        type: String,
        required: true,
    },
    verifValidUntil: {
        type: Date,
        required: true,
    },
    isActivated: {
        type: Boolean,
        required: true,
    },
    resetPWString: {
        type: String,
        required: false,
    },
    resetPWValidUntil: {
        type: Date,
        required: false,
    },
});
export default mongoose.model("User", userSchema);
