import mongoose from "mongoose";

export interface ISong {
  title: string;
  artist: string;
  sourceUrl: string;
  genres: string[];
  pictureUrl: string;
  audioUrl: string;
  startTimeExcerptMs: number;
  endTimeExcerptMs: number;
  bytes: number;
  durationMs: number;
}

const songSchema = new mongoose.Schema<ISong>({
  title: {
    type: String,
    required: true,
  },

  artist: {
    type: String,
    required: true,
  },

  sourceUrl: {
    type: String,
    required: true,
  },

  genres: {
    type: [String],
    default: [],
  },

  pictureUrl: {
    type: String,
    required: true,
  },

  audioUrl: {
    type: String,
    required: true,
  },

  startTimeExcerptMs: {
    type: Number,
    required: true,
  },

  endTimeExcerptMs: {
    type: Number,
    required: true,
  },

  bytes: {
    type: Number,
    required: true,
  },

  durationMs: {
    type: Number,
    required: true,
  },
});

export default mongoose.model<ISong>("Song", songSchema);
