import { UploadedFile } from "express-fileupload";
import { parseBuffer } from "music-metadata";
import fs from "fs";
import path from "path";

const parseAudio = async (audio: UploadedFile) => {
  const metadata = await parseBuffer(audio.data, {
    mimeType: audio.mimetype,
    size: audio.size,
  });

  const title = metadata.common.title;

  const duration_s = metadata.format.duration;

  const startTime_s =
    duration_s && Math.floor(Math.random() * (duration_s - 30));

  const endTime_s = startTime_s && startTime_s + 30;

  const genres = metadata.common.genre;

  let picture = metadata.common.picture?.shift();

  if (!picture) {
    const defaultPicturePath = path.join(
      __dirname,
      "../../assets/default-cover.jpg"
    );
    const defaultPicture = await fs.promises.readFile(defaultPicturePath);
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
  const audioBase64 = `data:${audio.mimetype};base64,${audio.data.toString(
    "base64"
  )}`;
  const pictureBase64 = `data:${picture.format};base64,${base64DataPicture}`;

  return {
    title,
    startTime_s,
    endTime_s,
    genres,
    audioBase64,
    pictureBase64,
  };
};

export { parseAudio };
