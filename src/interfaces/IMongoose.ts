import { Types } from "mongoose";

type IMongoose<T> = T &
  Partial<
    {
      _id: Types.ObjectId;
    } & {
      __v: number;
    }
  >;

export type { IMongoose };
