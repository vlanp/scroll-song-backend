import { UploadedFile } from "express-fileupload";
import { parseBuffer } from "music-metadata";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const parseAudio = async (audio: UploadedFile) => {
  // console.log(audio);
  const audioData = new Uint8Array(
    audio.data.buffer,
    audio.data.byteOffset,
    audio.data.byteLength
  );

  const metadata = await parseBuffer(audioData, {
    mimeType: audio.mimetype,
    size: audio.size,
  });

  // console.log(metadata);

  const title = metadata.common.title;

  const duration_s = metadata.format.duration;

  console.log(duration_s);

  const startTime_s =
    duration_s && Math.floor(Math.random() * (duration_s - 30));

  const endTime_s = startTime_s && startTime_s + 30;

  const genres = metadata.common.genre;

  let picture = metadata.common.picture?.shift();

  let pictureBuffer: Buffer;
  let pictureMimeType: string;

  if (!picture) {
    const defaultPicturePath = path.join(
      __dirname.replace("dist", "src"),
      "../assets/default-cover.jpg"
    );
    pictureBuffer = await fs.promises.readFile(defaultPicturePath);
    pictureMimeType = "image/jpeg";
  } else {
    pictureBuffer = Buffer.from(picture.data);
    pictureMimeType = picture.format;
  }

  // Convert the file to a base64 string
  const audioBase64 = `data:${audio.mimetype};base64,${audio.data.toString(
    "base64"
  )}`;
  const pictureBase64 = `data:${pictureMimeType};base64,${pictureBuffer.toString(
    "base64"
  )}`;

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
