import { UploadedFile } from "express-fileupload";
import { parseAudio } from "../../utils/audio.js";
import { v2 as cloudinary } from "cloudinary";
import Song, { ISong } from "../../models/Song.js";
import { parsePicture } from "../../utils/picture.js";

export const saveSongUtils = async (
  audio: UploadedFile,
  picture: UploadedFile,
  sourceUrl: string
): Promise<Boolean> => {
  const audioFolder = "/songs/audio/";
  const pictureFolder = "/songs/picture/";

  const { title, artist, startTimeSec, endTimeSec, genres, audioBase64 } =
    await parseAudio(audio);

  const pictureBase64 = parsePicture(picture);

  if (!title || !startTimeSec || !endTimeSec || !genres || !artist) {
    return false;
  }

  // Upload the file to cloudinary and retrieve the informations about the storage
  const uploadAudioPromise = cloudinary.uploader.upload(audioBase64, {
    folder: audioFolder,
    resource_type: "auto",
    timeout: 300000,
  });
  const uploadPicturePromise = cloudinary.uploader.upload(pictureBase64, {
    folder: pictureFolder,
    timeout: 300000,
  });

  const uploads = await Promise.all([uploadAudioPromise, uploadPicturePromise]);

  // Create a new song containing the secure_url from cloudinary and save it
  const newSong = new Song<ISong>({
    audioUrl: uploads[0].secure_url,
    sourceUrl: sourceUrl,
    artist: artist,
    startTimeExcerptMs: startTimeSec * 1000,
    endTimeExcerptMs: endTimeSec * 1000,
    pictureUrl: uploads[1].secure_url,
    genres: genres,
    title: title,
    bytes: uploads[0].bytes,
    durationMs: uploads[0].duration * 1000,
  });

  await newSong.save();

  return true;
};
