import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineItem } from '@shared/models/timeline';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <div *ngIf="items.length === 0" class="text-center py-6 text-slate-500 text-xs">
        No activity or comments on this ticket yet.
      </div>

      <!-- Load more button if items are hidden -->
      <div *ngIf="items.length > visibleCount" class="text-center py-2 border-b border-slate-900/50 pb-2">
        <button
          type="button"
          (click)="showAll()"
          class="text-[10px] font-bold text-teal-400 hover:text-teal-300 transition-colors px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/60"
        >
          View older activity ({{ items.length - visibleCount }} items hidden)
        </button>
      </div>

      <div *ngFor="let item of visibleItems(); trackBy: trackById" class="relative group">
        <!-- Vertical connector line -->
        <div class="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-800/80 group-last:hidden"></div>

        <!-- Feed item layout -->
        <div class="flex items-start space-x-3.5">
          <!-- Type icon/avatar -->
          <div class="relative z-10 flex-shrink-0">
            <div
              *ngIf="item.type === 'EVENT'"
              class="w-8 h-8 rounded-full bg-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-400"
            >
              <!-- Event icon (bullet/activity) -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div
              *ngIf="item.type === 'COMMENT'"
              [class.internal-avatar]="item.isInternal"
              class="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs uppercase"
            >
              {{ item.authorName.charAt(0) }}
            </div>
          </div>

          <!-- Feed body -->
          <div class="flex-1 min-w-0 bg-slate-900/20 border border-slate-800/60 rounded-xl p-3.5 backdrop-blur-sm transition-all duration-300 hover:border-slate-700/50">
            <!-- Header metadata -->
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-semibold text-slate-200">{{ item.authorName }}</span>
                <span class="text-[10px] text-slate-500">{{ item.createdAt | date:'short' }}</span>
                <span
                  *ngIf="item.type === 'COMMENT' && item.isInternal"
                  class="px-1.5 py-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-md"
                >
                  Internal Note
                </span>
              </div>

              <!-- Delete comment button for author/owner -->
              <button
                *ngIf="item.type === 'COMMENT' && canDeleteComment(item.authorId)"
                (click)="onDeleteComment(item.id)"
                class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1 rounded-md hover:bg-rose-500/10"
                title="Delete comment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <!-- Content text/preview -->
            <div
              *ngIf="item.type === 'COMMENT'"
              [innerHTML]="renderMarkdown(item.content)"
              class="text-xs text-slate-300 leading-relaxed break-words"
            ></div>

            <div
              *ngIf="item.type === 'EVENT'"
              class="text-xs text-slate-400 font-medium italic"
            >
              {{ item.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .internal-avatar {
      background: rgba(245, 158, 11, 0.1) !important;
      border-color: rgba(245, 158, 11, 0.3) !important;
      color: rgb(245, 158, 11) !important;
    }
  `]
})
export class ActivityFeedComponent {
  @Input() items: TimelineItem[] = [];
  @Input() currentUserId: number | null = null;
  @Input() currentUserRole: string | null = null;

  @Output() deleteComment = new EventEmitter<number>();

  visibleCount = 20;

  visibleItems(): TimelineItem[] {
    if (this.items.length <= this.visibleCount) {
      return this.items;
    }
    return this.items.slice(this.items.length - this.visibleCount);
  }

  showAll(): void {
    this.visibleCount = this.items.length + 100;
  }

  trackById(index: number, item: TimelineItem): number {
    return item.id;
  }

  canDeleteComment(authorId: number): boolean {
    if (this.currentUserRole === 'ADMIN') return true;
    return this.currentUserId === authorId;
  }

  onDeleteComment(id: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.deleteComment.emit(id);
    }
  }

  renderMarkdown(raw: string): string {
    if (!raw) return '';

    let html = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xs font-bold text-slate-200 mt-2 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-sm font-bold text-slate-100 mt-3 mb-1.5">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-base font-black text-slate-50 mt-4 mb-2">$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-100">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');
    html = html.replace(/__(.*?)__/g, '<strong class="font-bold text-slate-100">$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em class="italic text-slate-300">$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-950/85 border border-slate-800/80 text-teal-400 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto my-2">$1</pre>');
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-800/90 text-teal-300 px-1 py-0.5 rounded font-mono text-[11px] border border-slate-700/50">$1</code>');

    // Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-4 text-slate-300 my-0.5">$1</li>');
    html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="list-disc ml-4 text-slate-300 my-0.5">$1</li>');
    html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="list-decimal ml-4 text-slate-300 my-0.5">$1</li>');

    // Paragraphs
    html = html.split('\n\n').map(p => {
      if (p.trim().startsWith('<h') || p.trim().startsWith('<pre') || p.trim().startsWith('<li') || p.trim().startsWith('<ul')) {
        return p;
      }
      return `<p class="text-slate-300 leading-relaxed mb-2">${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  }
}
