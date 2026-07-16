import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Ticket, CreateTicketRequest, UpdateTicketRequest, TicketStatus } from '@shared/models/ticket';
import { Product } from '@shared/models/product';
import { User } from '@shared/models/user';
import { Comment, CreateCommentRequest } from '@shared/models/comment';
import { TimelineItem } from '@shared/models/timeline';
import { CommandPaletteSearchResponse } from '@shared/models/search';

@Injectable({ providedIn: 'root' })
export class TicketService {
  constructor(private api: ApiService) {}

  getProducts(): Observable<Product[]> {
    return this.api.get<Product[]>('/products');
  }

  getTickets(productId: number, filters?: Record<string, string | number | boolean | null | undefined>): Observable<Ticket[]> {
    return this.api.get<Ticket[]>(`/products/${productId}/tickets`, filters);
  }

  getTicket(id: number): Observable<Ticket> {
    return this.api.get<Ticket>(`/tickets/${id}`);
  }

  createTicket(productId: number, request: CreateTicketRequest): Observable<Ticket> {
    return this.api.post<Ticket>(`/products/${productId}/tickets`, request);
  }

  updateTicket(id: number, request: UpdateTicketRequest): Observable<Ticket> {
    return this.api.put<Ticket>(`/tickets/${id}`, request);
  }

  transitionStatus(id: number, status: TicketStatus): Observable<Ticket> {
    return this.api.patch<Ticket>(`/tickets/${id}/status`, { status });
  }

  getTimeline(id: number): Observable<TimelineItem[]> {
    return this.api.get<TimelineItem[]>(`/tickets/${id}/timeline`);
  }

  createComment(ticketId: number, request: CreateCommentRequest): Observable<Comment> {
    return this.api.post<Comment>(`/tickets/${ticketId}/comments`, request);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.api.delete<void>(`/comments/${commentId}`);
  }

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('/users');
  }

  searchCommandPalette(query: string, currentLocation: string): Observable<CommandPaletteSearchResponse> {
    return this.api.post<CommandPaletteSearchResponse>('/search/command-palette', { query, currentLocation });
  }
}
