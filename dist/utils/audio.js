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
exports.parseAudio = void 0;
const music_metadata_1 = require("music-metadata");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const parseAudio = (audio) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const metadata = yield (0, music_metadata_1.parseBuffer)(audio.data, {
        mimeType: audio.mimetype,
        size: audio.size,
    });
    const title = metadata.common.title;
    const duration_s = metadata.format.duration;
    const startTime_s = duration_s && Math.floor(Math.random() * (duration_s - 30));
    const endTime_s = startTime_s && startTime_s + 30;
    const genres = metadata.common.genre;
    let picture = (_a = metadata.common.picture) === null || _a === void 0 ? void 0 : _a.shift();
    if (!picture) {
        const defaultPicturePath = path_1.default.join(__dirname, "../../assets/default-cover.jpg");
        const defaultPicture = yield fs_1.default.promises.readFile(defaultPicturePath);
        picture = {
            data: defaultPicture,
            format: "image/jpeg",
            description: "default cover",
            name: "default-cover.jpg",
        };
    }
    const base64DataPicture = Buffer.isBuffer(picture.data)
        ? picture.data.toString("base64")
        : picture.data;
    // Convert the file to a base64 string
    const audioBase64 = `data:${audio.mimetype};base64,${audio.data.toString("base64")}`;
    const pictureBase64 = `data:${picture.format};base64,${base64DataPicture}`;
    return {
        title,
        startTime_s,
        endTime_s,
        genres,
        audioBase64,
        pictureBase64,
    };
});
exports.parseAudio = parseAudio;
