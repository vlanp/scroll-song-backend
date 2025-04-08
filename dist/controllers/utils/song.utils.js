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
exports.saveSongUtils = void 0;
const audio_1 = require("../../utils/audio");
const cloudinary_1 = require("cloudinary");
const Song_1 = __importDefault(require("../../models/Song"));
const saveSongUtils = (audio) => __awaiter(void 0, void 0, void 0, function* () {
    const audioFolder = "/songs/audio/";
    const pictureFolder = "/songs/picture/";
    const { title, startTime_s, endTime_s, genres, audioBase64, pictureBase64 } = yield (0, audio_1.parseAudio)(audio);
    if (!title || !startTime_s || !endTime_s || !genres) {
        return false;
    }
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
    const uploads = yield Promise.all([uploadAudioPromise, uploadPicturePromise]);
    // Create a new song containing the secure_url from cloudinary and save it
    const newSong = new Song_1.default({
        audio_url: uploads[0].secure_url,
        start_time_excerpt_ms: startTime_s * 1000,
        end_time_excerpt_ms: endTime_s * 1000,
        picture_url: uploads[1].secure_url,
        genres: genres,
        title: title,
        bytes: uploads[0].bytes,
        duration_ms: uploads[0].duration,
    });
    yield newSong.save();
    return true;
});
exports.saveSongUtils = saveSongUtils;
