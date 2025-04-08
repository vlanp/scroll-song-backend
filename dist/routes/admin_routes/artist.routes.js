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
const express_1 = __importDefault(require("express"));
const Artist_1 = __importDefault(require("../../models/Artist"));
const isAdmin_1 = __importDefault(require("../../middlewares/isAdmin"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cloudinary_1 = require("cloudinary");
const Social_1 = __importDefault(require("../../enums/Social"));
const router = express_1.default.Router();
router.post("/admin/artist", isAdmin_1.default, (0, express_fileupload_1.default)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description } = req.body;
        const eSocials = Object.values(Social_1.default);
        const banner = (_a = req.files) === null || _a === void 0 ? void 0 : _a.banner;
        if (!banner) {
            return res.status(400).json({ message: "No banner received" });
        }
        if (Array.isArray(banner)) {
            return res
                .status(406)
                .json({
                message: "Multiple banner received. Only one banner allowed.",
            });
        }
        if (!description || typeof description !== "string") {
            return res.status(400).json({ message: "Empty artist description" });
        }
        const socials = {
            instagram: "",
            spotify: "",
            deezer: "",
            facebook: "",
            twitter: "",
            website: "",
        };
        for (const eSocial of eSocials) {
            socials[eSocial] = req.body[eSocial];
            if (!socials[eSocial]) {
                return res.status(400).json({ message: eSocial + " is missing" });
            }
        }
        if (!name || typeof name !== "string") {
            return res.status(400).json({ message: "Empty artist name" });
        }
        const artist = yield Artist_1.default.find({ name: name });
        if (artist.length > 0) {
            return res
                .status(406)
                .json({ message: "There is already an artist with this name" });
        }
        const newArtist = new Artist_1.default({
            name: name,
            banner_url: "", // need the _id of the artist for the cloudinary folder, so banner_url is added later
            description: description,
            socials: socials,
            votes: 0,
            songs: [],
            tokens: 0
        });
        const folder = "/artists/" + newArtist._id;
        // Convert the file to a base64 string
        const pictureBase64 = `data:${banner.mimetype};base64,${banner.data.toString("base64")}`;
        // Upload the file to cloudinary and retrieve the informations about the storage
        const upload = yield cloudinary_1.v2.uploader.upload(pictureBase64, {
            folder: folder,
        });
        newArtist.banner_url = upload.secure_url;
        yield newArtist.save();
        res.status(201).json({ message: "Artiste créé en base de donnée" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
