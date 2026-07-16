export type TicketStatus = 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketType = 'BUG' | 'FEATURE' | 'TASK' | 'SUPPORT';

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  projectId: number;
  assigneeId: number | null;
  reporterId: number;
  createdAt: string;
  updatedAt: string;
  allowedTransitions?: TicketStatus[];
  canAssign?: boolean;
  canEdit?: boolean;
  isSlaBreached?: boolean;
}

export interface CreateTicketRequest {
  title: string;
  description?: string;
  priority: TicketPriority;
  type: TicketType;
}

export interface UpdateTicketRequest {
  title: string;
  description?: string;
  priority: TicketPriority;
  type: TicketType;
  assigneeId?: number | null;
}

export interface TransitionStatusRequest {
  status: TicketStatus;
}

export const TICKET_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  BACKLOG: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['IN_REVIEW', 'CANCELLED'],
  IN_REVIEW: ['DONE', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
};
