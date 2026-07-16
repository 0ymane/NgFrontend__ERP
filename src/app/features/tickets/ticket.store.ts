import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TicketService } from './services/ticket.service';
import { Ticket, CreateTicketRequest, UpdateTicketRequest, TicketStatus } from '@shared/models/ticket';
import { Product } from '@shared/models/product';
import { User } from '@shared/models/user';
import { Comment, CreateCommentRequest } from '@shared/models/comment';
import { TimelineItem } from '@shared/models/timeline';

@Injectable({ providedIn: 'root' })
export class TicketStore {
  private ticketService = inject(TicketService);

  // State Signals
  private _products = signal<Product[]>([]);
  private _selectedProduct = signal<Product | null>(null);
  private _tickets = signal<Ticket[]>([]);
  private _users = signal<User[]>([]);
  private _timeline = signal<TimelineItem[]>([]);
  private _activeTicket = signal<Ticket | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Selectors
  products = this._products.asReadonly();
  selectedProduct = this._selectedProduct.asReadonly();
  tickets = this._tickets.asReadonly();
  users = this._users.asReadonly();
  timeline = this._timeline.asReadonly();
  activeTicket = this._activeTicket.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  async loadProducts(): Promise<void> {
    this._loading.set(true);
    try {
      const prods = await firstValueFrom(this.ticketService.getProducts());
      this._products.set(prods);
      if (prods.length > 0 && !this._selectedProduct()) {
        this.selectProduct(prods[0]);
      }
    } catch (err: any) {
      this._error.set(err.message || 'Failed to load products');
    } finally {
      this._loading.set(false);
    }
  }

  selectProduct(product: Product): void {
    this._selectedProduct.set(product);
    this.loadTickets();
  }

  async loadTickets(filters?: Record<string, string | number | boolean | null | undefined>): Promise<void> {
    const prod = this._selectedProduct();
    if (!prod) return;

    this._loading.set(true);
    try {
      const list = await firstValueFrom(this.ticketService.getTickets(prod.id, filters));
      this._tickets.set(list);
    } catch (err: any) {
      this._error.set(err.message || 'Failed to load tickets');
    } finally {
      this._loading.set(false);
    }
  }

  async loadUsers(): Promise<void> {
    try {
      const list = await firstValueFrom(this.ticketService.getUsers());
      this._users.set(list);
    } catch (err: any) {
      console.error('Failed to load users', err);
    }
  }

  async selectTicket(ticketId: number | null): Promise<void> {
    if (ticketId === null) {
      this._activeTicket.set(null);
      this._timeline.set([]);
      return;
    }

    this._loading.set(true);
    try {
      const ticket = await firstValueFrom(this.ticketService.getTicket(ticketId));
      this._activeTicket.set(ticket);
      await this.loadTimeline(ticketId);
    } catch (err: any) {
      this._error.set(err.message || 'Failed to fetch ticket');
    } finally {
      this._loading.set(false);
    }
  }

  async loadTimeline(ticketId: number): Promise<void> {
    try {
      const list = await firstValueFrom(this.ticketService.getTimeline(ticketId));
      this._timeline.set(list);
    } catch (err: any) {
      console.error('Failed to load timeline', err);
    }
  }

  async createTicket(request: CreateTicketRequest): Promise<void> {
    const prod = this._selectedProduct();
    if (!prod) return;

    this._loading.set(true);
    try {
      const t = await firstValueFrom(this.ticketService.createTicket(prod.id, request));
      this._tickets.update(list => [t, ...list]);
    } catch (err: any) {
      this._error.set(err.message || 'Failed to create ticket');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async updateTicket(ticketId: number, request: UpdateTicketRequest): Promise<void> {
    this._loading.set(true);
    try {
      const t = await firstValueFrom(this.ticketService.updateTicket(ticketId, request));
      this._tickets.update(list => list.map(item => item.id === ticketId ? t : item));
      if (this._activeTicket()?.id === ticketId) {
        this._activeTicket.set(t);
        await this.loadTimeline(ticketId);
      }
    } catch (err: any) {
      this._error.set(err.message || 'Failed to update ticket');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async transitionStatus(ticketId: number, status: TicketStatus): Promise<void> {
    try {
      const t = await firstValueFrom(this.ticketService.transitionStatus(ticketId, status));
      this._tickets.update(list => list.map(item => item.id === ticketId ? t : item));
      if (this._activeTicket()?.id === ticketId) {
        this._activeTicket.set(t);
        await this.loadTimeline(ticketId);
      }
    } catch (err: any) {
      this._error.set(err.message || 'Failed to transition ticket');
      throw err;
    }
  }

  async createComment(ticketId: number, request: CreateCommentRequest): Promise<void> {
    try {
      await firstValueFrom(this.ticketService.createComment(ticketId, request));
      await this.loadTimeline(ticketId);
    } catch (err: any) {
      this._error.set(err.message || 'Failed to create comment');
      throw err;
    }
  }
}
