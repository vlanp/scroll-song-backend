import { UploadedFile } from "express-fileupload";
import { parseBuffer } from "music-metadata";

const parseAudio = async (audio: UploadedFile) => {
  const audioData = new Uint8Array(
    audio.data.buffer,
    audio.data.byteOffset,
    audio.data.byteLength
  );

  const metadata = await parseBuffer(audioData, {
    mimeType: audio.mimetype,
    size: audio.size,
  });

  const artist = metadata.common.artist;

  const title = metadata.common.title;

  const durationSec = metadata.format.duration;

  const startTimeSec =
    durationSec && Math.floor(Math.random() * (durationSec - 30));

  const endTimeSec = startTimeSec && startTimeSec + 30;

  const genres = metadata.common.genre;

  const audioBase64 = `data:${audio.mimetype};base64,${audio.data.toString(
    "base64"
  )}`;

  return {
    title,
    artist,
    startTimeSec,
    endTimeSec,
    genres,
    audioBase64,
  };
};

export { parseAudio };
