export interface Media {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  width: number | null;
  height: number | null;
  size: number;
  postId: string | null;
  createdAt: Date;
}
