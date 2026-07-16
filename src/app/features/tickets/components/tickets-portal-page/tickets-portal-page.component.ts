import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '@features/auth/auth.store';
import { TicketStore } from '@features/tickets/ticket.store';
import { TicketService } from '@features/tickets/services/ticket.service';
import { Ticket, TicketPriority, TicketStatus, TicketType } from '@shared/models/ticket';
import { Product } from '@shared/models/product';
import { WysiwygEditorComponent } from '@shared/components/wysiwyg-editor/wysiwyg-editor.component';
import { ActivityFeedComponent } from '@shared/components/activity-feed/activity-feed.component';

@Component({
  selector: 'app-tickets-portal-page',
  standalone: true,
  imports: [CommonModule, FormsModule, WysiwygEditorComponent, ActivityFeedComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- Portal Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 class="text-2xl font-black text-slate-100 flex items-center space-x-3">
            <span>My Support Tickets</span>
            <span class="px-2.5 py-0.5 text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full">
              {{ filteredTickets().length }}
            </span>
          </h1>
          <p class="text-xs text-slate-500 mt-1">Submit, track, and discuss your requests with our support team.</p>
        </div>

        <button
          (click)="openCreateModal()"
          class="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.15)] hover:shadow-[0_0_25px_rgba(20,184,166,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          + Submit Ticket
        </button>
      </div>

      <!-- Filters Panel -->
      <div class="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <input
            type="text"
            [(ngModel)]="searchText"
            placeholder="Search tickets by title or description..."
            class="w-full bg-slate-950/60 border border-slate-850 px-4 py-2 pl-10 rounded-xl text-xs text-slate-200 focus:border-teal-500/50 outline-none transition-colors"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
        </div>

        <!-- Dropdowns -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Product Select -->
          <select
            [(ngModel)]="filterProduct"
            class="bg-slate-950/60 border border-slate-850 px-3.5 py-2 rounded-xl text-xs text-slate-300 outline-none focus:border-teal-500/50 transition-colors"
          >
            <option value="">All Products</option>
            <option *ngFor="let p of ticketStore.products()" [value]="p.id">{{ p.name }}</option>
          </select>

          <!-- Priority Select -->
          <select
            [(ngModel)]="filterPriority"
            class="bg-slate-950/60 border border-slate-850 px-3.5 py-2 rounded-xl text-xs text-slate-300 outline-none focus:border-teal-500/50 transition-colors"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <!-- Status Select -->
          <select
            [(ngModel)]="filterStatus"
            class="bg-slate-950/60 border border-slate-850 px-3.5 py-2 rounded-xl text-xs text-slate-300 outline-none focus:border-teal-500/50 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Tickets List Table -->
      <div class="bg-slate-900/30 border border-slate-900 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-900 bg-slate-950/10 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th class="px-6 py-4">ID</th>
                <th class="px-6 py-4">Title</th>
                <th class="px-6 py-4">Product</th>
                <th class="px-6 py-4">Priority</th>
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-900/60">
              <tr
                *ngFor="let t of filteredTickets()"
                (click)="openTicketDetails(t)"
                class="hover:bg-slate-900/40 cursor-pointer transition-colors group"
              >
                <!-- ID -->
                <td class="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-400 group-hover:text-slate-200">
                  {{ getProductKey(t.projectId) }}-{{ t.id }}
                </td>
                <!-- Title -->
                <td class="px-6 py-4 max-w-md">
                  <div class="text-xs font-bold text-slate-200 truncate group-hover:text-teal-400 transition-colors">
                    {{ t.title }}
                  </div>
                  <div *ngIf="t.description" class="text-[10px] text-slate-500 truncate mt-0.5">
                    {{ stripHtml(t.description) }}
                  </div>
                </td>
                <!-- Product -->
                <td class="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-400">
                  {{ getProductName(t.projectId) }}
                </td>
                <!-- Priority -->
                <td class="px-6 py-4 whitespace-nowrap text-xs">
                  <span [class]="getPriorityClass(t.priority)" class="font-bold uppercase tracking-wide">
                    {{ t.priority }}
                  </span>
                </td>
                <!-- Type -->
                <td class="px-6 py-4 whitespace-nowrap text-xs">
                  <span [class]="getTypeClass(t.type)" class="font-bold uppercase tracking-wider">
                    {{ t.type }}
                  </span>
                </td>
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap text-xs">
                  <span [class]="getStatusClass(t.status)" class="px-2 py-0.5 font-bold rounded-md uppercase text-[9px] border">
                    {{ t.status.replace('_', ' ') }}
                  </span>
                </td>
                <!-- Updated -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-xs text-slate-500">
                  {{ t.updatedAt | date:'short' }}
                </td>
              </tr>
              <tr *ngIf="filteredTickets().length === 0">
                <td colspan="7" class="text-center py-12 text-xs text-slate-500 italic">
                  No tickets found matching current filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CREATE TICKET MODAL -->
      <div *ngIf="isCreateModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" (click)="closeCreateModal()"></div>

        <!-- Content Box -->
        <div class="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
          <h2 class="text-lg font-black text-slate-100 mb-4">Submit Support Ticket</h2>

          <form (submit)="submitCreateTicket($event)" class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
              <input
                type="text"
                [(ngModel)]="newTicket.title"
                name="title"
                required
                class="w-full bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-200 focus:border-teal-500/50 outline-none"
                placeholder="Brief summary of the issue..."
              />
            </div>

            <!-- Product Dropdown -->
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Product</label>
              <select
                [(ngModel)]="newTicket.productId"
                name="productId"
                required
                class="w-full bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-200 outline-none focus:border-teal-500/50"
              >
                <option [ngValue]="null" disabled>Select the product...</option>
                <option *ngFor="let p of ticketStore.products()" [ngValue]="p.id">
                  {{ p.name }} ({{ p.key }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
              <app-wysiwyg-editor
                [(value)]="newTicket.description"
                [placeholder]="'Provide additional detail, error logs, or reproduction steps...'"
              ></app-wysiwyg-editor>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                <select
                  [(ngModel)]="newTicket.priority"
                  name="priority"
                  class="w-full bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-250 outline-none focus:border-teal-500/50"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                <select
                  [(ngModel)]="newTicket.type"
                  name="type"
                  class="w-full bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-250 outline-none focus:border-teal-500/50"
                >
                  <option value="SUPPORT">Support</option>
                  <option value="BUG">Bug</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-850">
              <button
                type="button"
                (click)="closeCreateModal()"
                class="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!newTicket.title.trim() || !newTicket.productId"
                class="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl disabled:opacity-40 transition-colors"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- TICKET DETAILS SIDE DRAWER PANEL -->
      <div *ngIf="ticketStore.activeTicket()" class="fixed inset-0 z-40 flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" (click)="closeDetails()"></div>

        <!-- Drawer Content -->
        <div class="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
          <!-- Drawer Header -->
          <div class="p-4 border-b border-slate-800 bg-slate-950/20 flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 text-xs font-black bg-slate-800 border border-slate-700 rounded text-slate-200">
                {{ getProductKey(ticketStore.activeTicket()!.projectId) }}-{{ ticketStore.activeTicket()!.id }}
              </span>
              <span
                [class]="getStatusClass(ticketStore.activeTicket()!.status)"
                class="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border"
              >
                {{ ticketStore.activeTicket()!.status.replace('_', ' ') }}
              </span>
            </div>

            <button (click)="closeDetails()" class="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Drawer Scrollable Body -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Left 2 columns: Title & Description -->
              <div class="md:col-span-2 space-y-4">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                  <input
                    type="text"
                    [ngModel]="ticketStore.activeTicket()?.title"
                    (ngModelChange)="onUpdateField('title', $event)"
                    [disabled]="!ticketStore.activeTicket()?.canEdit"
                    class="w-full bg-slate-950/50 border border-slate-850 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-200 focus:border-teal-500/50 outline-none"
                  />
                </div>

                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <app-wysiwyg-editor
                    [value]="ticketStore.activeTicket()?.description || ''"
                    (valueChange)="onUpdateField('description', $event)"
                    [placeholder]="'Provide additional detail...'"
                    *ngIf="ticketStore.activeTicket()?.canEdit"
                  ></app-wysiwyg-editor>
                  <div
                    *ngIf="!ticketStore.activeTicket()?.canEdit"
                    [innerHTML]="ticketStore.activeTicket()?.description"
                    class="p-4 bg-slate-950/20 border border-slate-850 rounded-xl text-xs text-slate-300 leading-relaxed min-h-[100px]"
                  ></div>
                </div>
              </div>

              <!-- Right 1 column: Metadata side stats -->
              <div class="space-y-4 bg-slate-950/30 p-4 border border-slate-850 rounded-2xl h-fit">
                <!-- Status Actions -->
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <div class="flex items-center justify-between bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
                    <span class="text-xs font-bold text-slate-200 uppercase">
                      {{ ticketStore.activeTicket()?.status }}
                    </span>
                    <button
                      *ngIf="ticketStore.activeTicket()?.status !== 'CANCELLED' && ticketStore.activeTicket()?.status !== 'DONE'"
                      (click)="onCancelTicket()"
                      class="px-2 py-1 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-extrabold text-[9px] rounded-lg uppercase transition-all"
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>

                <!-- Priority -->
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    [ngModel]="ticketStore.activeTicket()?.priority"
                    (ngModelChange)="onUpdateField('priority', $event)"
                    [disabled]="!ticketStore.activeTicket()?.canEdit"
                    class="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <!-- Type -->
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                  <div class="bg-slate-900/60 border border-slate-850 px-3 py-2 rounded-xl text-xs text-slate-400 font-bold uppercase">
                    {{ ticketStore.activeTicket()?.type }}
                  </div>
                </div>

                <!-- Assignee -->
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assignee</label>
                  <div class="bg-slate-900/60 border border-slate-850 px-3 py-2 rounded-xl text-xs text-slate-400 font-medium">
                    {{ getAssigneeName(ticketStore.activeTicket()?.assigneeId) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity & Discussion Section -->
            <div class="border-t border-slate-800/80 pt-6 space-y-4">
              <h3 class="text-sm font-bold text-slate-100">
                Discussion & Timeline Feed
              </h3>

              <app-activity-feed
                [items]="ticketStore.timeline()"
                [currentUserId]="authStore.currentUser()?.userId ?? null"
                [currentUserRole]="authStore.currentUser()?.role ?? null"
                (deleteComment)="deleteComment($event)"
              ></app-activity-feed>

              <!-- Reply Box -->
              <div class="space-y-2 mt-4">
                <div
                  *ngIf="!isReplying"
                  (click)="isReplying = true"
                  class="w-full bg-slate-950/40 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-slate-500 cursor-pointer hover:border-slate-700/60 hover:text-slate-400 transition-colors"
                >
                  Add a comment or message support...
                </div>

                <app-wysiwyg-editor
                  *ngIf="isReplying"
                  [(value)]="newCommentText"
                  [placeholder]="'Type your reply...'"
                ></app-wysiwyg-editor>

                <div class="flex justify-end space-x-2" *ngIf="isReplying">
                  <button
                    type="button"
                    (click)="isReplying = false"
                    class="px-3.5 py-1.5 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-bold text-xs rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    (click)="submitComment()"
                    [disabled]="!newCommentText.trim()"
                    class="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl disabled:opacity-40 transition-colors"
                  >
                    Send Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TicketsPortalPageComponent implements OnInit {
  authStore = inject(AuthStore);
  ticketStore = inject(TicketStore);
  private ticketService = inject(TicketService);

  // Filters State
  searchText = '';
  filterProduct = '';
  filterPriority = '';
  filterStatus = '';

  // Local Combined Tickets List
  allTickets = signal<Ticket[]>([]);

  // Discussion state
  newCommentText = '';
  isReplying = false;

  // Create Modal State
  isCreateModalOpen = signal<boolean>(false);
  newTicket = {
    title: '',
    productId: null as number | null,
    description: '',
    priority: 'LOW' as TicketPriority,
    type: 'SUPPORT' as TicketType
  };

  ngOnInit(): void {
    this.loadAllPortalData();
  }

  async loadAllPortalData(): Promise<void> {
    try {
      // 1. Ensure products and users are loaded in store
      await this.ticketStore.loadProducts();
      await this.ticketStore.loadUsers();

      // 2. Fetch tickets for all products in parallel
      const prods = this.ticketStore.products();
      const promises = prods.map(p => firstValueFrom(this.ticketService.getTickets(p.id)));
      const ticketArrays = await Promise.all(promises);
      const combined = ticketArrays.reduce((acc, curr) => acc.concat(curr), [] as Ticket[]);

      // Sort by updatedAt descending
      combined.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      this.allTickets.set(combined);
    } catch (err) {
      console.error('Failed to load tickets portal data', err);
    }
  }

  // Reactive filters selector
  filteredTickets = computed(() => {
    const query = this.searchText.trim().toLowerCase();
    const prodFilter = this.filterProduct;
    const prioFilter = this.filterPriority;
    const statFilter = this.filterStatus;

    return this.allTickets().filter(t => {
      // Title or description match
      if (query) {
        const titleMatch = t.title.toLowerCase().includes(query);
        const descMatch = t.description?.toLowerCase().includes(query) ?? false;
        if (!titleMatch && !descMatch) return false;
      }
      // Product
      if (prodFilter && t.projectId !== Number(prodFilter)) {
        return false;
      }
      // Priority
      if (prioFilter && t.priority !== prioFilter) {
        return false;
      }
      // Status
      if (statFilter && t.status !== statFilter) {
        return false;
      }
      return true;
    });
  });

  // Ticket Operations
  openTicketDetails(ticket: Ticket): void {
    this.isReplying = false;
    this.ticketStore.selectTicket(ticket.id);
  }

  closeDetails(): void {
    this.ticketStore.selectTicket(null);
  }

  async onUpdateField(field: string, val: any): Promise<void> {
    const active = this.ticketStore.activeTicket();
    if (!active) return;

    const request: any = {
      title: active.title,
      description: active.description || undefined,
      priority: active.priority,
      type: active.type,
      assigneeId: active.assigneeId
    };
    request[field] = val;

    try {
      const updated = await firstValueFrom(this.ticketService.updateTicket(active.id, request));
      // Update local copy
      this.allTickets.update(list => list.map(item => item.id === active.id ? updated : item));
      await this.ticketStore.selectTicket(active.id);
    } catch (err) {
      alert('Failed to update ticket: ' + err);
    }
  }

  async onCancelTicket(): Promise<void> {
    const active = this.ticketStore.activeTicket();
    if (!active) return;

    if (!confirm('Are you sure you want to cancel this ticket request? This action cannot be undone.')) {
      return;
    }

    try {
      const updated = await firstValueFrom(this.ticketService.transitionStatus(active.id, 'CANCELLED' as TicketStatus));
      this.allTickets.update(list => list.map(item => item.id === active.id ? updated : item));
      await this.ticketStore.selectTicket(active.id);
    } catch (err) {
      alert('Failed to cancel ticket: ' + err);
    }
  }

  async submitComment(): Promise<void> {
    const active = this.ticketStore.activeTicket();
    if (!active || !this.newCommentText.trim()) return;

    try {
      await this.ticketStore.createComment(active.id, {
        content: this.newCommentText,
        isInternal: false
      });
      this.newCommentText = '';
      this.isReplying = false;
    } catch (err) {
      alert('Failed to send comment: ' + err);
    }
  }

  async deleteComment(commentId: number): Promise<void> {
    const active = this.ticketStore.activeTicket();
    if (!active) return;

    try {
      await firstValueFrom(this.ticketService.deleteComment(commentId));
      await this.ticketStore.loadTimeline(active.id);
    } catch (err) {
      alert('Failed to delete comment: ' + err);
    }
  }

  // Create Modal Actions
  openCreateModal(): void {
    this.newTicket = {
      title: '',
      productId: this.filterProduct ? Number(this.filterProduct) : null,
      description: '',
      priority: 'LOW' as TicketPriority,
      type: 'SUPPORT' as TicketType
    };
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  async submitCreateTicket(event: Event): Promise<void> {
    event.preventDefault();
    const productId = this.newTicket.productId ? Number(this.newTicket.productId) : null;
    if (!productId || !this.newTicket.title.trim()) return;

    try {
      const requestPayload = {
        title: this.newTicket.title,
        description: this.newTicket.description,
        priority: this.newTicket.priority,
        type: this.newTicket.type
      };

      const created = await firstValueFrom(this.ticketService.createTicket(productId, requestPayload));
      // Prepend to list
      this.allTickets.update(list => [created, ...list]);
      this.closeCreateModal();
    } catch (err) {
      alert('Failed to create ticket: ' + err);
    }
  }

  // Helpers
  getProductKey(productId: number): string {
    const prod = this.ticketStore.products().find(p => p.id === productId);
    return prod ? prod.key : 'TKT';
  }

  getProductName(productId: number): string {
    const prod = this.ticketStore.products().find(p => p.id === productId);
    return prod ? prod.name : 'Unknown Product';
  }

  getAssigneeName(assigneeId: number | null | undefined): string {
    if (!assigneeId) return 'Unassigned';
    const user = this.ticketStore.users().find(u => u.id === assigneeId);
    return user ? (user.name || user.email) : 'Support Agent';
  }

  stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  }

  getPriorityClass(priority: TicketPriority): string {
    switch (priority) {
      case 'LOW': return 'text-slate-500';
      case 'MEDIUM': return 'text-sky-400';
      case 'HIGH': return 'text-amber-500';
      default: return 'text-rose-500 font-extrabold';
    }
  }

  getTypeClass(type: TicketType): string {
    switch (type) {
      case 'BUG': return 'text-rose-400';
      default: return 'text-teal-400';
    }
  }

  getStatusClass(status: TicketStatus): string {
    switch (status) {
      case 'BACKLOG': return 'bg-slate-800/40 border-slate-700/60 text-slate-400';
      case 'IN_PROGRESS': return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
      case 'IN_REVIEW': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'DONE': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      default: return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    }
  }
}
