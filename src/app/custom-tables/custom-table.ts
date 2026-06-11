import { Component, input, computed, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
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

  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();

  @ContentChild('expandedDetail', { read: TemplateRef }) expandedDetailTemplate?: TemplateRef<any>;

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
