import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Transactions } from './transactions';
import { CommonService } from '../common-service/common-service';

describe('Transactions', () => {
  let component: Transactions;
  let fixture: ComponentFixture<Transactions>;
  let mockCommonService: any;

  const mockAccountsResponse = {
    status: 0,
    message: 'Success',
    data: [
      { id: 1, accountNumber: 'ACC0001', firstName: 'John', lastName: 'Doe', balance: 5000 },
      { id: 2, accountNumber: 'ACC0002', firstName: 'Jane', lastName: 'Smith', balance: 10000 }
    ]
  };

  const mockTransactionsResponse = {
    status: 0,
    message: 'Success',
    data: [
      { id: 101, accountNumber: 'ACC0001', transactionType: 'DEPOSIT', amount: 1000, postBalance: 5000, timestamp: '2026-06-09 10:00:00' },
      { id: 102, accountNumber: 'ACC0001', transactionType: 'WITHDRAWAL', amount: 500, postBalance: 4500, timestamp: '2026-06-09 10:30:00' }
    ]
  };

  beforeEach(async () => {
    mockCommonService = {
      get: vi.fn().mockImplementation((url: string) => {
        if (url.includes('transactions')) {
          return of(mockTransactionsResponse);
        }
        return of(mockAccountsResponse);
      })
    };

    await TestBed.configureTestingModule({
      imports: [Transactions, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: CommonService, useValue: mockCommonService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Transactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts and auto-select first account transactions on init', () => {
    expect(mockCommonService.get).toHaveBeenCalled();
    expect(component.accounts().length).toBe(2);
    expect(component.selectedAccountNumber()).toBe('ACC0001');
    expect(component.transactions().length).toBe(2);
  });

  it('should reload transactions on account number selection change', () => {
    mockCommonService.get.mockClear();
    component.onAccountChange({ target: { value: 'ACC0002' } });
    expect(component.selectedAccountNumber()).toBe('ACC0002');
    expect(mockCommonService.get).toHaveBeenCalled();
  });

  it('should reload transactions with date query param when date change occurs', () => {
    mockCommonService.get.mockClear();
    component.filterForm.patchValue({ dateFilter: '2026-06-09' });
    component.onDateChange();
    expect(mockCommonService.get).toHaveBeenCalledWith(expect.stringContaining('?date=2026-06-09'));
  });

  it('should clear date filter and fetch all transactions', () => {
    component.filterForm.patchValue({ dateFilter: '2026-06-09' });
    mockCommonService.get.mockClear();
    component.clearDateFilter();
    expect(component.filterForm.value.dateFilter).toBe('');
    expect(mockCommonService.get).toHaveBeenCalled();
  });
});
