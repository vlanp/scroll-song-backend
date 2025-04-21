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
  verifCode: number;
  verifValidUntil: Date;
  isActivated: boolean;
  resetPWCode?: number;
  resetPWValidUntil?: Date;
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
    required: false,
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
  verifCode: {
    type: Number,
    required: true,
  },
  verifValidUntil: {
    type: Date,
    required: true,
  },
  isActivated: {
    type: Boolean,
    required: true,
  },
  resetPWCode: {
    type: Number,
    required: false,
  },
  resetPWValidUntil: {
    type: Date,
    required: false,
  },
});

export default mongoose.model<IUser>("User", userSchema);
