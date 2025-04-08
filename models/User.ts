import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  avatar: string;
  authToken: string;
  unselectedGenres: string[];
  dislikedSongs: mongoose.Types.ObjectId[];
  likedSongs: {
    song: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  authToken: {
    type: String,
    required: true,
  },

  unselectedGenres: {
    type: [String],
  },

  dislikedSongs: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Song",
  },

  likedSongs: {
    type: [
      {
        song: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Song",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
});

export default mongoose.model<IUser>("User", userSchema);
