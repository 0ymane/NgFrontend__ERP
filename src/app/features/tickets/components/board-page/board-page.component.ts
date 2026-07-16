import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '@features/auth/auth.store';
import { TicketStore } from '@features/tickets/ticket.store';
import { TicketService } from '../../services/ticket.service';
import { Ticket, TicketStatus, TicketPriority, TicketType } from '@shared/models/ticket';
import { Product } from '@shared/models/product';
import { User } from '@shared/models/user';
import { WysiwygEditorComponent } from '@shared/components/wysiwyg-editor/wysiwyg-editor.component';
import { ActivityFeedComponent } from '@shared/components/activity-feed/activity-feed.component';

@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [CommonModule, FormsModule, WysiwygEditorComponent, ActivityFeedComponent],
  template: `
    <div class="h-[calc(100vh-65px)] flex flex-col overflow-hidden bg-slate-950">
      <!-- Toolbar Filter Bar -->
      <div class="px-6 py-3 border-b border-slate-900 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Search input -->
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchText"
              placeholder="Filter tickets..."
              class="w-48 px-3 py-1.5 pl-8 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-teal-500/50"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>

          <!-- Priority Filter -->
          <select [(ngModel)]="filterPriority" class="bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 outline-none">
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <!-- Type Filter -->
          <select [(ngModel)]="filterType" class="bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 outline-none">
            <option value="">All Types</option>
            <option value="BUG">Bug</option>
            <option value="FEATURE">Feature</option>
            <option value="TASK">Task</option>
            <option value="SUPPORT">Support</option>
          </select>

          <!-- Assignee Filter -->
          <select [(ngModel)]="filterAssignee" class="bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 outline-none">
            <option value="">All Assignees</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>

        <!-- Action Button -->
        <button
          (click)="openCreateModal()"
          class="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/10 transition-all duration-300 hover:scale-[1.02]"
        >
          + Create Ticket
        </button>
      </div>

      <!-- Kanban Board Grid -->
      <div class="flex-1 overflow-x-auto p-6 flex space-x-4 items-start select-none">
        <div
          *ngFor="let col of columns"
          (dragover)="onDragOver($event)"
          (drop)="onDrop($event, col.status)"
          [class.highlight-zone]="isDropAllowed(col.status)"
          class="w-72 flex-shrink-0 bg-slate-900/30 border border-slate-900/80 rounded-2xl p-4 flex flex-col max-h-full transition-all duration-300 relative"
        >
          <!-- Column Header -->
          <div class="flex items-center justify-between mb-3.5 px-1">
            <div class="flex items-center space-x-2">
              <span [class]="getColumnDotClass(col.status)" class="w-2.5 h-2.5 rounded-full"></span>
              <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">{{ col.label }}</h3>
            </div>
            <span class="px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-900/60 rounded-md border border-slate-800/50">
              {{ getTicketsForColumn(col.status).length }}
            </span>
          </div>

          <!-- Cards Scroll Container -->
          <div class="flex-1 overflow-y-auto space-y-3 min-h-[250px] pr-1">
            <div
              *ngFor="let ticket of getTicketsForColumn(col.status)"
              draggable="true"
              (dragstart)="onDragStart(ticket)"
              (dragend)="onDragEnd()"
              (click)="openTicketDetails(ticket)"
              class="ticket-card bg-slate-900/50 border border-slate-850 hover:border-slate-700/60 rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:bg-slate-850/30 transition-all duration-300 group"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="px-1.5 py-0.5 text-[9px] font-extrabold bg-slate-850 border border-slate-800 rounded text-slate-400 group-hover:text-slate-200 transition-colors">
                  {{ ticketStore.selectedProduct()?.key }}-{{ ticket.id }}
                </span>
                <span [class]="getPriorityClass(ticket.priority)" class="text-[9px] font-bold uppercase">
                  {{ ticket.priority }}
                </span>
              </div>
              <h4 class="text-xs font-semibold text-slate-200 leading-snug truncate">
                {{ ticket.title }}
              </h4>
              <p *ngIf="ticket.description" class="text-[10px] text-slate-500 mt-1 line-clamp-2">
                {{ stripHtml(ticket.description) }}
              </p>

              <!-- Footer (Type & Assignee) -->
              <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-850/60">
                <span [class]="getTypeClass(ticket.type)" class="text-[9px] font-bold uppercase tracking-wider">
                  {{ ticket.type }}
                </span>

                <!-- Assignee Initials or Unassigned icon -->
                <div class="flex items-center">
                  <div
                    *ngIf="ticket.assigneeId"
                    class="w-5.5 h-5.5 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[9px] text-teal-400 font-bold uppercase"
                    [title]="getUserName(ticket.assigneeId)"
                  >
                    {{ getUserInitials(ticket.assigneeId) }}
                  </div>
                  <div
                    *ngIf="!ticket.assigneeId"
                    class="w-5.5 h-5.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600"
                    title="Unassigned"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 01-7.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty zone hint -->
            <div *ngIf="getTicketsForColumn(col.status).length === 0" class="text-center py-8 text-[11px] text-slate-600 italic">
              Empty Column
            </div>
          </div>
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
                {{ ticketStore.selectedProduct()?.key }}-{{ ticketStore.activeTicket()?.id }}
              </span>
              <span
                [class]="getColumnDotClass(ticketStore.activeTicket()!.status)"
                class="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase"
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
            <!-- Split layout: Main content & Meta sidebar -->
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
                    [placeholder]="'Provide a detailed description of the task...'"
                    *ngIf="ticketStore.activeTicket()?.canEdit"
                  ></app-wysiwyg-editor>
                  <div
                    *ngIf="!ticketStore.activeTicket()?.canEdit"
                    [innerHTML]="renderHTML(ticketStore.activeTicket()?.description)"
                    class="p-4 bg-slate-950/20 border border-slate-850 rounded-xl text-xs text-slate-300 leading-relaxed min-h-[100px]"
                  ></div>
                </div>
              </div>

              <!-- Right 1 column: Metadata side stats -->
              <div class="space-y-4 bg-slate-950/30 p-4 border border-slate-850 rounded-2xl h-fit">
                <!-- Status Transitions -->
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select
                    [ngModel]="ticketStore.activeTicket()?.status"
                    (ngModelChange)="onTransitionStatus($event)"
                    class="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    <option [value]="ticketStore.activeTicket()?.status">
                      {{ ticketStore.activeTicket()?.status }} (Current)
                    </option>
                    <option *ngFor="let nextStatus of ticketStore.activeTicket()?.allowedTransitions" [value]="nextStatus">
                      {{ nextStatus }}
                    </option>
                  </select>
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
                  <select
                    [ngModel]="ticketStore.activeTicket()?.type"
                    (ngModelChange)="onUpdateField('type', $event)"
                    [disabled]="!ticketStore.activeTicket()?.canEdit"
                    class="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    <option value="BUG">Bug</option>
                    <option value="FEATURE" *ngIf="authStore.role() !== 'CLIENT'">Feature</option>
                    <option value="TASK" *ngIf="authStore.role() !== 'CLIENT'">Task</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>

                <!-- Assignee -->
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assignee</label>
                  <select
                    [ngModel]="ticketStore.activeTicket()?.assigneeId"
                    (ngModelChange)="onUpdateField('assigneeId', $event)"
                    [disabled]="!ticketStore.activeTicket()?.canAssign"
                    class="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    <option [value]="null">Unassigned</option>
                    <option *ngFor="let u of supportUsers()" [value]="u.id">
                      {{ u.name || u.email }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Activity & Discussion Section -->
            <div class="border-t border-slate-800/80 pt-6 space-y-4">
              <h3 class="text-sm font-bold text-slate-100 flex items-center justify-between">
                <span>Discussion & Activity Feed</span>
              </h3>

              <app-activity-feed
                [items]="ticketStore.timeline()"
                [currentUserId]="authStore.currentUser()?.userId ?? null"
                [currentUserRole]="authStore.currentUser()?.role ?? null"
                (deleteComment)="deleteComment($event)"
              ></app-activity-feed>

              <!-- New Comment Box -->
              <div class="space-y-2 mt-4">
                <!-- Toggle Internal Note switch for Support/Admin -->
                <div class="flex items-center justify-between" *ngIf="isReplying && authStore.role() !== 'CLIENT'">
                  <div class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="internalToggle"
                      [(ngModel)]="newCommentInternal"
                      class="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/50"
                    />
                    <label for="internalToggle" class="text-xs font-bold text-amber-400 select-none">
                      🔒 Internal Note (Agents/Admins Only)
                    </label>
                  </div>
                </div>

                <!-- Static placeholder -->
                <div
                  *ngIf="!isReplying"
                  (click)="isReplying = true"
                  class="w-full bg-slate-950/40 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-slate-500 cursor-pointer hover:border-slate-700/60 hover:text-slate-400 transition-colors"
                >
                  {{ authStore.role() === 'CLIENT' ? 'Add comment...' : 'Add comment (type @Name to mention)...' }}
                </div>

                <!-- Lazy WYSIWYG Editor -->
                <app-wysiwyg-editor
                  *ngIf="isReplying"
                  [(value)]="newCommentText"
                  [placeholder]="authStore.role() === 'CLIENT' ? 'Add comment...' : 'Add comment (type @Name to mention)...'"
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

      <!-- CREATE TICKET DIALOG OVERLAY -->
      <div *ngIf="isCreateModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" (click)="closeCreateModal()"></div>

        <!-- Box -->
        <div class="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
          <h2 class="text-lg font-black text-slate-100 mb-4">Create Ticket</h2>

          <form (submit)="submitCreateTicket($event)" class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
              <input
                type="text"
                [(ngModel)]="newTicket.title"
                name="title"
                required
                class="w-full bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-200 focus:border-teal-500/50 outline-none"
                placeholder="Brief summary..."
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
              <app-wysiwyg-editor
                [(value)]="newTicket.description"
                [placeholder]="'Provide additional logs, context, or reproduction steps...'"
              ></app-wysiwyg-editor>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                <select
                  [(ngModel)]="newTicket.priority"
                  name="priority"
                  class="w-full bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 outline-none"
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
                  class="w-full bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 outline-none"
                >
                  <option value="BUG">Bug</option>
                  <option value="FEATURE" *ngIf="authStore.role() !== 'CLIENT'">Feature</option>
                  <option value="TASK" *ngIf="authStore.role() !== 'CLIENT'">Task</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                (click)="closeCreateModal()"
                class="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!newTicket.title.trim()"
                class="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl disabled:opacity-40 transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .highlight-zone {
      border-color: rgba(20, 184, 166, 0.4) !important;
      background: rgba(20, 184, 166, 0.03) !important;
      box-shadow: 0 0 15px rgba(20, 184, 166, 0.08);
    }
    .ticket-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ticket-card:hover {
      transform: translateY(-1.5px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
  `]
})
export class BoardPageComponent implements OnInit {
  authStore = inject(AuthStore);
  ticketStore = inject(TicketStore);
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);

  // Filters State
  searchText = '';
  filterPriority = '';
  filterType = '';
  filterAssignee = '';

  // Columns definition
  columns = [
    { label: 'Backlog', status: 'BACKLOG' as TicketStatus },
    { label: 'In Progress', status: 'IN_PROGRESS' as TicketStatus },
    { label: 'In Review', status: 'IN_REVIEW' as TicketStatus },
    { label: 'Done', status: 'DONE' as TicketStatus },
    { label: 'Cancelled', status: 'CANCELLED' as TicketStatus }
  ];

  // Drag and drop tracking
  private draggedTicketObj: Ticket | null = null;

  // Drawer discussion state
  newCommentText = '';
  newCommentInternal = false;
  isReplying = false;

  // Create Modal state
  isCreateModalOpen = signal<boolean>(false);
  newTicket = {
    title: '',
    description: '',
    priority: 'LOW' as TicketPriority,
    type: 'SUPPORT' as TicketType
  };

  ngOnInit(): void {
    // Expose window trigger for command palette integration
    (window as any).openCreateTicketModal = () => this.openCreateModal();

    // Check queryParams for deep-linked ticketId
    this.route.queryParams.subscribe(params => {
      if (params['ticketId']) {
        const id = Number(params['ticketId']);
        this.ticketStore.selectTicket(id);
      }
    });
  }

  getTicketsForColumn(status: TicketStatus): Ticket[] {
    const list = this.ticketStore.tickets().filter(t => t.status === status);
    
    // Apply client filters
    return list.filter(t => {
      // Title/Description match
      if (this.searchText.trim() !== '') {
        const query = this.searchText.toLowerCase();
        const tMatch = t.title.toLowerCase().includes(query);
        const dMatch = t.description?.toLowerCase().includes(query) ?? false;
        if (!tMatch && !dMatch) return false;
      }

      // Priority match
      if (this.filterPriority !== '' && t.priority !== this.filterPriority) {
        return false;
      }

      // Type match
      if (this.filterType !== '' && t.type !== this.filterType) {
        return false;
      }

      // Assignee match
      if (this.filterAssignee !== '') {
        if (this.filterAssignee === 'me') {
          return t.assigneeId === this.authStore.currentUser()?.userId;
        }
        if (this.filterAssignee === 'unassigned') {
          return t.assigneeId === null;
        }
      }

      return true;
    });
  }

  // HTML5 Drag and Drop events
  onDragStart(ticket: Ticket): void {
    this.draggedTicketObj = ticket;
  }

  onDragEnd(): void {
    this.draggedTicketObj = null;
  }

  onDragOver(event: DragEvent): void {
    // Must prevent default to allow drop
    event.preventDefault();

    // Auto-scroll the scrollable column container if dragging near the boundary
    const columnContainer = (event.target as HTMLElement).closest('.overflow-y-auto') as HTMLElement;
    if (columnContainer) {
      const rect = columnContainer.getBoundingClientRect();
      const relativeY = event.clientY - rect.top;
      const threshold = 40; // px threshold from boundary
      const scrollSpeed = 8; // px to scroll per event tick

      if (relativeY < threshold) {
        columnContainer.scrollTop -= scrollSpeed;
      } else if (rect.height - relativeY < threshold) {
        columnContainer.scrollTop += scrollSpeed;
      }
    }
  }

  isDropAllowed(status: TicketStatus): boolean {
    if (!this.draggedTicketObj) return false;
    return this.draggedTicketObj.allowedTransitions?.includes(status) ?? false;
  }

  onDrop(event: DragEvent, status: TicketStatus): void {
    event.preventDefault();
    if (this.draggedTicketObj && this.isDropAllowed(status)) {
      this.ticketStore.transitionStatus(this.draggedTicketObj.id, status);
    }
  }

  // Details drawer trigger
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

    if (field === 'assigneeId') {
      request[field] = val === 'null' || val === null ? null : Number(val);
    } else {
      request[field] = val;
    }

    try {
      await this.ticketStore.updateTicket(active.id, request);
    } catch (err) {
      alert('Error updating field: ' + err);
    }
  }

  async onTransitionStatus(nextStatus: TicketStatus): Promise<void> {
    const active = this.ticketStore.activeTicket();
    if (!active) return;
    try {
      await this.ticketStore.transitionStatus(active.id, nextStatus);
    } catch (err) {
      alert('Error transitioning status: ' + err);
    }
  }

  // Comments & Timeline actions
  async submitComment(): Promise<void> {
    const active = this.ticketStore.activeTicket();
    if (!active || !this.newCommentText.trim()) return;

    try {
      await this.ticketStore.createComment(active.id, {
        content: this.newCommentText,
        isInternal: this.newCommentInternal
      });
      this.newCommentText = '';
      this.newCommentInternal = false;
      this.isReplying = false;
    } catch (err) {
      alert('Failed to send comment: ' + err);
    }
  }

  async deleteComment(commentId: number): Promise<void> {
    // Delete comment
    const active = this.ticketStore.activeTicket();
    if (!active) return;
    try {
      await firstValueFrom(this.ticketService.deleteComment(commentId));
      await this.ticketStore.loadTimeline(active.id);
    } catch (err) {
      alert('Failed to delete comment: ' + err);
    }
  }

  // Create Ticket Actions
  openCreateModal(): void {
    this.newTicket = {
      title: '',
      description: '',
      priority: 'LOW',
      type: 'SUPPORT'
    };
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  async submitCreateTicket(event: Event): Promise<void> {
    event.preventDefault();
    try {
      await this.ticketStore.createTicket(this.newTicket);
      this.closeCreateModal();
    } catch (err) {
      alert('Failed to create ticket: ' + err);
    }
  }

  // Utility mapping helpers
  supportUsers = computed(() => {
    return this.ticketStore.users().filter(u => u.role !== 'CLIENT');
  });

  getUserName(id: number): string {
    const u = this.ticketStore.users().find(user => user.id === id);
    return u ? (u.name || u.email) : 'System';
  }

  getUserInitials(id: number): string {
    const u = this.ticketStore.users().find(user => user.id === id);
    if (!u) return 'S';
    const n = u.name || u.email;
    return n.charAt(0).toUpperCase();
  }

  getColumnDotClass(status: TicketStatus): string {
    switch (status) {
      case 'BACKLOG': return 'bg-slate-700';
      case 'IN_PROGRESS': return 'bg-sky-500';
      case 'IN_REVIEW': return 'bg-indigo-500';
      case 'DONE': return 'bg-teal-500';
      default: return 'bg-rose-500';
    }
  }

  getPriorityClass(priority: TicketPriority): string {
    switch (priority) {
      case 'LOW': return 'text-slate-500';
      case 'MEDIUM': return 'text-sky-400';
      case 'HIGH': return 'text-amber-500';
      default: return 'text-rose-500 font-black';
    }
  }

  getTypeClass(type: TicketType): string {
    switch (type) {
      case 'BUG': return 'text-rose-400';
      case 'FEATURE': return 'text-teal-400';
      case 'TASK': return 'text-sky-400';
      default: return 'text-indigo-400';
    }
  }

  stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  }

  renderHTML(raw: string | null | undefined): string {
    if (!raw) return '<p class="text-slate-500 italic">No description</p>';
    // Returns basic formatted or raw HTML safely
    return raw;
  }
}
