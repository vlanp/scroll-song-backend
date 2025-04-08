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
const isAdmin_1 = __importDefault(require("./middlewares/isAdmin"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cloudinary_1 = require("cloudinary");
const Song_1 = __importDefault(require("./models/Song"));
const music_metadata_1 = require("music-metadata");
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
/**
 * List of all parameters for the request:
 * @formdata @param audio: One or multiple audio files from the same artist
 * @formdata @param title1 ... @param titlei One title for each audio file. The order is important, title1 should correspond to the title of the first audio added...
 * @formdata @param picture One or multiple pictures corresponding to the audio files. If one picture is added for multiples audio files, the same picture will be used for every audio files. If there is multiple pictures, their must be one picture per audio file. The order is important, the first picture added should correspond to the first audio added...
 * @formdata @param startTime1 ... @param starTimei One startTime (in ms) for each audio file. The order is important, startTime1 should correspond to the startTime of the first audio added...
 * @formdata @param endTime1 ... @param endTimei One endTime (in ms) for each audio file. The order is important, endTime1 should correspond to the endTime of the first audio added...
 * @formdata @param genre1_1 ... @param genre1_y ... @param genrei_y As many genre than needed for each audio file. The order is important, i represent the audio file number and y is the the number of genre for the audio file.
 */
router.post("/admin/songs", isAdmin_1.default, (0, express_fileupload_1.default)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.files) {
            return res
                .status(400)
                .json({ message: "No files found in the request" });
        }
        if (!req.files.audio) {
            return res
                .status(400)
                .json({ message: "No audio found in the request" });
        }
        const audios = req.files.audio;
        const audioFolder = "/songs/audio/";
        const pictureFolder = "/songs/picture/";
        // Check if there is one or multiple files
        if (!Array.isArray(audios)) {
            const audio = audios;
            const metadata = yield (0, music_metadata_1.parseBuffer)(audio.data, {
                mimeType: audio.mimetype,
                size: audio.size,
            });
            if (!metadata.common.title) {
                return res
                    .status(400)
                    .json({ message: "No title found for the song" });
            }
            const duration_s = metadata.format.duration;
            if (!duration_s) {
                return res
                    .status(400)
                    .json({ message: "No duration found for the song" });
            }
            const startTime_s = Math.floor(Math.random() * (duration_s - 30));
            const endTime_s = startTime_s + 30;
            const genres = metadata.common.genre;
            if ((genres === null || genres === void 0 ? void 0 : genres.length) === 0) {
                return res
                    .status(400)
                    .json({ message: "No genre found for the song" });
            }
            const picture = (_a = metadata.common.picture) === null || _a === void 0 ? void 0 : _a.shift();
            if (!picture) {
                const defaultImagePath = path_1.default.join(__dirname, "../../assets/default-cover.jpg");
            }
            // Convert the file to a base64 string
            const audioBase64 = `data:${audio.mimetype};base64,${audio.data.toString("base64")}`;
            const pictureBase64 = `data:${picture.mimetype};base64,${picture.data.toString("base64")}`;
            // Upload the file to cloudinary and retrieve the informations about the storage
            const uploadAudioPromise = cloudinary_1.v2.uploader.upload(audioBase64, {
                folder: audioFolder,
                resource_type: "auto",
                timeout: 300000,
            });
            const uploadPicturePromise = cloudinary_1.v2.uploader.upload(pictureBase64, {
                folder: pictureFolder,
                timeout: 300000,
            });
            const uploads = yield Promise.all([
                uploadAudioPromise,
                uploadPicturePromise,
            ]);
            // Create a new song containing the secure_url from cloudinary and save it
            const newSong = new Song_1.default({
                artist: artist._id,
                audio_url: uploads[0].secure_url,
                start_time_excerpt_ms: startTime,
                end_time_excerpt_ms: endTime,
                picture_url: uploads[1].secure_url,
                genres: genres,
                title: title,
                tokens: 0,
                bytes: uploads[0].bytes,
                duration_ms: uploads[0].duration,
            });
            const saveSongPromise = newSong.save();
            artist.songs.push(newSong._id);
            const saveArtistPromise = artist.save();
            yield Promise.all([saveSongPromise, saveArtistPromise]);
            res
                .status(201)
                .json({ message: "Song successfully stored in the database" });
        }
        else {
            const titles = [];
            const startsTimes = [];
            const endsTimes = [];
            const genresList = [];
            // Get titles for all songs
            for (let i = 0; i <= audios.length - 1; i++) {
                const title = req.body["title" + (i + 1)];
                if (pictures && !pictures[i]) {
                    return res
                        .status(400)
                        .json({ message: "No picture found for one of the songs" });
                }
                if (!title) {
                    return res
                        .status(400)
                        .json({ message: "No title found for one of the songs" });
                }
                titles.push(title);
                const startTime = Number(req.body["startTime" + (i + 1)]);
                if (!startTime) {
                    return res
                        .status(400)
                        .json({ message: "No startTime found for the song" });
                }
                startsTimes.push(startTime);
                const endTime = Number(req.body["endTime" + (i + 1)]);
                if (!endTime) {
                    return res
                        .status(400)
                        .json({ message: "No endTime found for the song" });
                }
                endsTimes.push(endTime);
                const genres = [];
                let y = 1;
                while (true) {
                    const genre = req.body["genre" + (i + 1) + "_" + y];
                    if (!genre) {
                        break;
                    }
                    else {
                        if (Object.values(EGenre).includes(genre)) {
                            genres.push(genre);
                            y++;
                        }
                        else {
                            return res
                                .status(400)
                                .json({ message: genre + " is not a valid genre" });
                        }
                    }
                }
                if (genres.length === 0) {
                    return res
                        .status(400)
                        .json({ message: "No genre found for a song" });
                }
                genresList.push(genres);
            }
            const arrayOfPicturesUploadsPromises = [];
            if (picture) {
                const pictureBase64 = `data:${picture.mimetype};base64,${picture.data.toString("base64")}`;
                const uploadPicturePromise = cloudinary_1.v2.uploader.upload(pictureBase64, {
                    folder: pictureFolder,
                    timeout: 300000,
                });
                arrayOfPicturesUploadsPromises.push(uploadPicturePromise);
            }
            else if (pictures) {
                pictures.forEach((picture) => {
                    const pictureBase64 = `data:${picture.mimetype};base64,${picture.data.toString("base64")}`;
                    const uploadPicturePromise = cloudinary_1.v2.uploader.upload(pictureBase64, {
                        folder: pictureFolder,
                        timeout: 300000,
                    });
                    arrayOfPicturesUploadsPromises.push(uploadPicturePromise);
                });
            }
            else {
                return res
                    .status(400)
                    .json({ message: "No picture found in the request" });
            }
            const arrayOfAudiosUploadsPromises = [];
            audios.forEach((song) => {
                // Convert the file to a base64 string
                const songBase64 = `data:${song.mimetype};base64,${song.data.toString("base64")}`;
                // Upload the file to cloudinary and retrieve the promise
                const uploadPromise = cloudinary_1.v2.uploader.upload(songBase64, {
                    folder: audioFolder,
                    resource_type: "auto",
                    timeout: 300000,
                });
                // Keep track of all promises
                arrayOfAudiosUploadsPromises.push(uploadPromise);
            });
            // Wait for all promises to complete and retrieve all results
            const uploads = yield Promise.all([
                ...arrayOfAudiosUploadsPromises,
                ...arrayOfPicturesUploadsPromises,
            ]);
            const audiosUploads = uploads.splice(0, audios.length);
            const picturesUploads = uploads;
            const arrayOfSavesPromises = [];
            audiosUploads.forEach((audioUpload, index) => {
                const newSong = new Song_1.default({
                    artist: artist._id,
                    audio_url: audioUpload.secure_url,
                    end_time_excerpt_ms: endsTimes[index],
                    start_time_excerpt_ms: startsTimes[index],
                    picture_url: (picturesUploads[index] || picturesUploads[0])
                        .secure_url,
                    genres: genresList[index],
                    title: titles[index],
                    tokens: 0,
                    bytes: audioUpload.bytes,
                    duration_ms: audioUpload.duration,
                });
                const saveSongPromise = newSong.save();
                artist.songs.push(newSong._id);
                arrayOfSavesPromises.push(saveSongPromise);
            });
            const saveArtistPromise = artist.save();
            yield Promise.all([...arrayOfSavesPromises, saveArtistPromise]);
            res
                .status(201)
                .json({ message: "Songs successfully stored in the database" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
