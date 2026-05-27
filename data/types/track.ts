export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  addedBy: string;
  plays: number;
  url: string;
  coverUrl: string | null;
}