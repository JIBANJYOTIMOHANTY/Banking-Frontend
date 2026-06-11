import { Component, input, computed, Output, EventEmitter, ContentChild, TemplateRef, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn, TableButton } from './custom-table-models/custom-table-model';

@Component({
  selector: 'app-custom-table',
  imports: [CommonModule],
  templateUrl: './custom-table.html',
  styleUrl: './custom-table.css',
})
export class CustomTable {
  columns = input<TableColumn[]>([]);
  data = input<any[]>([]);
  searchQuery = input<string>('');
  rowIdKey = input<string>('id');
  expandedRowId = input<any>(null);
  pageSize = input<number>(10);

  currentPage = signal<number>(1);

  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();

  @ContentChild('expandedDetail', { read: TemplateRef }) expandedDetailTemplate?: TemplateRef<any>;

  constructor() {
    effect(() => {
      this.filteredData();
      untracked(() => {
        this.currentPage.set(1);
      });
    });
  }

  filteredData = computed(() => {
    const rawData = this.data();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return rawData;

    return rawData.filter((row) => {
      return Object.entries(row).some(([key, val]) => {
        return String(val).toLowerCase().includes(query);
      });
    });
  });

  totalPages = computed(() => {
    const data = this.filteredData();
    const size = this.pageSize();
    return Math.max(1, Math.ceil(data.length / size));
  });

  paginatedData = computed(() => {
    const data = this.filteredData();
    const size = this.pageSize();
    const page = Math.min(this.currentPage(), this.totalPages());
    const startIndex = (page - 1) * size;
    return data.slice(startIndex, startIndex + size);
  });

  getStartIndex(): number {
    if (this.filteredData().length === 0) return 0;
    const page = Math.min(this.currentPage(), this.totalPages());
    return (page - 1) * this.pageSize() + 1;
  }

  getEndIndex(): number {
    const page = Math.min(this.currentPage(), this.totalPages());
    return Math.min(page * this.pageSize(), this.filteredData().length);
  }

  goToPage(page: number) {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    const current = this.currentPage();
    const total = this.totalPages();
    if (current < total) {
      this.currentPage.set(current + 1);
    }
  }

  prevPage() {
    const current = this.currentPage();
    if (current > 1) {
      this.currentPage.set(current - 1);
    }
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = Math.min(this.currentPage(), total);
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) {
        pages.push(-1); // represents ellipsis
      }
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (current < total - 2) {
        pages.push(-1); // represents ellipsis
      }
      if (!pages.includes(total)) pages.push(total);
    }
    return pages;
  }

  getAlignmentClass(align?: 'left' | 'right' | 'center'): string {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
  }

  getButtonLabel(btn: TableButton, row: any): string {
    if (typeof btn.label === 'function') {
      return btn.label(row);
    }
    return btn.label;
  }

  getButtonIcon(btn: TableButton, row: any): string {
    if (!btn.icon) return '';
    if (typeof btn.icon === 'function') {
      return btn.icon(row);
    }
    return btn.icon;
  }

  onButtonClick(actionName: string, row: any) {
    this.actionClick.emit({ action: actionName, row });
  }

  // Transaction Helpers
  getTransactionClass(type: string): string {
    const t = (type || '').toUpperCase();
    if (t.includes('DEPOSIT') || t.includes('IN') || t.includes('INITIAL')) {
      return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    }
    return 'text-rose-700 bg-rose-50 border-rose-100';
  }

  getTransactionIcon(type: string): string {
    const t = (type || '').toUpperCase();
    if (t.includes('DEPOSIT') || t.includes('IN') || t.includes('INITIAL')) {
      return 'arrow_downward';
    }
    return 'arrow_upward';
  }

  isCredit(type: string): boolean {
    const t = (type || '').toUpperCase();
    return t.includes('DEPOSIT') || t.includes('IN') || t.includes('INITIAL');
  }
}
