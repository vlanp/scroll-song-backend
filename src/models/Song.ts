import mongoose from "mongoose";

export interface ISong {
  title: string;
  genres: string[];
  picture_url: string;
  audio_url: string;
  start_time_excerpt_ms: number;
  end_time_excerpt_ms: number;
  bytes: number;
  duration_ms: number;
}

const songSchema = new mongoose.Schema<ISong>({
  title: {
    type: String,
    required: true,
  },

  genres: {
    type: [String],
    default: [],
  },

  picture_url: {
    type: String,
    required: true,
  },

  audio_url: {
    type: String,
    required: true,
  },

  start_time_excerpt_ms: {
    type: Number,
    required: true,
  },

  end_time_excerpt_ms: {
    type: Number,
    required: true,
  },

  bytes: {
    type: Number,
    required: true,
  },

  duration_ms: {
    type: Number,
    required: true,
  },
});

export default mongoose.model<ISong>("Song", songSchema);
