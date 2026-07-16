import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-wysiwyg-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wysiwyg-container border border-slate-700/60 rounded-xl bg-slate-900/40 backdrop-blur-md overflow-hidden transition-all duration-300 focus-within:border-teal-500/50 focus-within:ring-1 focus-within:ring-teal-500/50">
      <!-- Tab Selector / Toolbar Header -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/40">
        <div class="flex items-center space-x-1">
          <button
            type="button"
            (click)="setMode('write')"
            [class.active-tab]="mode === 'write'"
            class="px-3 py-1 text-xs font-semibold rounded-md transition-all text-slate-400 hover:text-slate-200"
          >
            Write
          </button>
          <button
            type="button"
            (click)="setMode('preview')"
            [class.active-tab]="mode === 'preview'"
            class="px-3 py-1 text-xs font-semibold rounded-md transition-all text-slate-400 hover:text-slate-200"
          >
            Preview
          </button>
        </div>

        <!-- Toolbar controls -->
        <div *ngIf="mode === 'write'" class="flex items-center space-x-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800/80">
          <button type="button" (click)="insertText('**', '**')" title="Bold" class="toolbar-btn font-bold">B</button>
          <button type="button" (click)="insertText('_', '_')" title="Italic" class="toolbar-btn italic">I</button>
          <button type="button" (click)="insertText('# ', '')" title="Header 1" class="toolbar-btn">H1</button>
          <button type="button" (click)="insertText('## ', '')" title="Header 2" class="toolbar-btn">H2</button>
          <button type="button" (click)="insertText('- ', '')" title="Bullet List" class="toolbar-btn">•</button>
          <button type="button" (click)="insertText('1. ', '')" title="Numbered List" class="toolbar-btn">1.</button>
          <button type="button" (click)="insertText('\`\`\`\\n', '\\n\`\`\`')" title="Code Block" class="toolbar-btn font-mono">&lt;/&gt;</button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="relative min-h-[140px]">
        <textarea
          #textareaEl
          *ngIf="mode === 'write'"
          [(ngModel)]="value"
          (ngModelChange)="onValueChange($event)"
          (keydown)="handleKeyDown($event)"
          [placeholder]="placeholder"
          class="w-full min-h-[140px] max-h-[300px] p-3.5 bg-transparent border-0 outline-none text-slate-200 placeholder-slate-500 font-sans text-sm resize-y focus:ring-0"
        ></textarea>

        <div
          *ngIf="mode === 'preview'"
          [innerHTML]="getSanitizedPreview()"
          class="w-full min-h-[140px] max-h-[300px] p-4 overflow-y-auto text-sm text-slate-300 font-sans leading-relaxed select-text"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .active-tab {
      background: rgba(20, 184, 166, 0.15);
      color: rgb(45, 212, 191) !important;
      border: 1px solid rgba(20, 184, 166, 0.25);
    }
    .toolbar-btn {
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: rgb(148, 163, 184);
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    .toolbar-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: rgb(241, 245, 249);
    }
    .toolbar-btn:active {
      transform: scale(0.95);
    }
  `]
})
export class WysiwygEditorComponent {
  @Input() value = '';
  @Input() placeholder = 'Leave a comment... Support markdown shortcuts (#, **, ```)';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('textareaEl') textareaEl!: ElementRef<HTMLTextAreaElement>;

  mode: 'write' | 'preview' = 'write';

  setMode(newMode: 'write' | 'preview'): void {
    this.mode = newMode;
  }

  onValueChange(val: string): void {
    this.value = val;
    this.valueChange.emit(val);
  }

  insertText(before: string, after: string): void {
    if (!this.textareaEl) return;
    const txtArea = this.textareaEl.nativeElement;
    const startPos = txtArea.selectionStart;
    const endPos = txtArea.selectionEnd;
    const text = txtArea.value;

    const selectedText = text.substring(startPos, endPos);
    const replacement = before + (selectedText || '') + after;

    this.value = text.substring(0, startPos) + replacement + text.substring(endPos);
    this.valueChange.emit(this.value);

    // Refocus and place cursor
    setTimeout(() => {
      txtArea.focus();
      txtArea.selectionStart = startPos + before.length;
      txtArea.selectionEnd = startPos + before.length + (selectedText ? selectedText.length : 0);
    });
  }

  handleKeyDown(event: KeyboardEvent): void {
    // Markdown shortcuts
    if (event.key === ' ' && this.textareaEl) {
      const txtArea = this.textareaEl.nativeElement;
      const startPos = txtArea.selectionStart;
      const text = txtArea.value;
      const currentLineStart = text.lastIndexOf('\n', startPos - 1) + 1;
      const lineText = text.substring(currentLineStart, startPos);

      // Match markdown headers and list patterns
      if (lineText === '#') {
        event.preventDefault();
        this.insertShortcut(' ', '', 1);
      } else if (lineText === '##') {
        event.preventDefault();
        this.insertShortcut(' ', '', 2);
      } else if (lineText === '-') {
        event.preventDefault();
        this.insertShortcut(' ', '', 1);
      }
    }
  }

  private insertShortcut(before: string, after: string, offset: number): void {
    const txtArea = this.textareaEl.nativeElement;
    const startPos = txtArea.selectionStart;
    const text = txtArea.value;

    this.value = text.substring(0, startPos) + before + after + text.substring(startPos);
    this.valueChange.emit(this.value);

    setTimeout(() => {
      txtArea.focus();
      txtArea.selectionStart = startPos + before.length;
      txtArea.selectionEnd = startPos + before.length;
    });
  }

  getSanitizedPreview(): string {
    const raw = this.value;
    if (!raw) return '<p class="text-slate-500 italic font-sans text-xs">Nothing to preview</p>';

    let html = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-slate-200 mt-3 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-slate-100 mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-slate-50 mt-5 mb-3">$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-100">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');
    html = html.replace(/__(.*?)__/g, '<strong class="font-bold text-slate-100">$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em class="italic text-slate-300">$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-950/80 border border-slate-800 text-teal-400 p-3 rounded-lg font-mono text-xs overflow-x-auto my-3">$1</pre>');
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-800/80 text-teal-300 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-700/50">$1</code>');

    // Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-5 text-slate-300 my-1">$1</li>');
    html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="list-disc ml-5 text-slate-300 my-1">$1</li>');
    html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="list-decimal ml-5 text-slate-300 my-1">$1</li>');

    // Paragraphs
    html = html.split('\n\n').map(p => {
      if (p.trim().startsWith('<h') || p.trim().startsWith('<pre') || p.trim().startsWith('<li') || p.trim().startsWith('<ul')) {
        return p;
      }
      return `<p class="text-slate-300 leading-relaxed mb-3">${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  }
}
