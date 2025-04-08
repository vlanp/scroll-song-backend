import { UploadedFile } from "express-fileupload";
import { parseAudio } from "../../utils/audio";
import { v2 as cloudinary } from "cloudinary";
import Song, { ISong } from "../../models/Song";

export const saveSongUtils = async (audio: UploadedFile): Promise<Boolean> => {
  const audioFolder = "/songs/audio/";
  const pictureFolder = "/songs/picture/";

  const { title, startTime_s, endTime_s, genres, audioBase64, pictureBase64 } =
    await parseAudio(audio);

  if (!title || !startTime_s || !endTime_s || !genres) {
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
    audio_url: uploads[0].secure_url,
    start_time_excerpt_ms: startTime_s * 1000,
    end_time_excerpt_ms: endTime_s * 1000,
    picture_url: uploads[1].secure_url,
    genres: genres,
    title: title,
    bytes: uploads[0].bytes,
    duration_ms: uploads[0].duration,
  });

  await newSong.save();

  return true;
};
