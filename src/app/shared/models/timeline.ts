export interface TimelineItem {
  id: number;
  type: 'COMMENT' | 'EVENT';
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  isInternal?: boolean;
}
