import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-skeleton-loading',
  imports: [CommonModule],
  templateUrl: './custom-skeleton-loading.html',
  styleUrl: './custom-skeleton-loading.css',
})
export class CustomSkeletonLoading {
  cols = input<number>(5);
  rows = input<number>(5);
  columns = input<any[]>([]);

  getColArray(): number[] {
    const colsCount = this.columns().length || this.cols();
    return Array(Math.max(1, colsCount)).fill(0);
  }

  getRowArray(): number[] {
    return Array(Math.max(1, this.rows())).fill(0);
  }

  getColWidthClass(index: number): string {
    const widths = ['w-2/3', 'w-1/2', 'w-3/4', 'w-5/6', 'w-1/3'];
    return widths[index % widths.length];
  }
}
