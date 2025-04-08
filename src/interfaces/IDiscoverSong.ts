export interface IDiscoverSong {
  id: string;
  artist: string;
  sourceUrl: string;
  title: string;
  pictureUrl: string;
  genres: string[];
  audioUrl: string;
  startTimeExcerptMs: number;
  endTimeExcerptMs: number;
}
