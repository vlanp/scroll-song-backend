import User from "../models/User.js";
export default async function isAuthenticated(req, res, next) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        const user = await User.findOne({ authToken: token }).populate([
            "dislikedSongs",
            "likedSongs.song",
            "votedSongs.song",
            "artists",
            "badges.badge",
        ]);
        await user?.populate("likedSongs.song.artist", "votedSongs.song.artist");
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
}
