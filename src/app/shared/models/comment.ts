export interface Comment {
  id: number;
  content: string;
  ticketId: number;
  authorId: number;
  createdAt: string;
  isInternal?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  isInternal?: boolean;
}
