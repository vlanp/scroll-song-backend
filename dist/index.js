"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const cloudinary_1 = require("cloudinary");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const song_routes_1 = __importDefault(require("./routes/admin_routes/song.routes"));
const discover_routes_1 = __importDefault(require("./routes/discover.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const app = (0, express_1.default)();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
});
mongoose_1.default.connect(process.env.MONGODB_URI || "");
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(user_routes_1.default);
app.use(discover_routes_1.default);
app.use(song_routes_1.default);
app.all("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
