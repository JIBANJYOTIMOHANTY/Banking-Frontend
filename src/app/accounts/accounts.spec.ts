import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Accounts } from './accounts';
import { CommonService } from '../common-service/common-service';

describe('Accounts', () => {
  let component: Accounts;
  let fixture: ComponentFixture<Accounts>;
  let mockCommonService: any;

  const mockAccountsResponse = {
    status: 0,
    message: 'Success',
    data: [
      { id: 1, accountNumber: 'ACC0001', firstName: 'John', lastName: 'Doe', balance: 5000 },
      { id: 2, accountNumber: 'ACC0002', firstName: 'Jane', lastName: 'Smith', balance: 15000 }
    ]
  };

  beforeEach(async () => {
    mockCommonService = {
      get: vi.fn().mockReturnValue(of(mockAccountsResponse)),
      post: vi.fn().mockReturnValue(of({ status: 0, message: 'Created successfully' })),
      put: vi.fn().mockReturnValue(of({ status: 0, message: 'Transaction successful' })),
      delete: vi.fn().mockReturnValue(of({ status: 0, message: 'Deleted successfully' }))
    };

    await TestBed.configureTestingModule({
      imports: [Accounts, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: CommonService, useValue: mockCommonService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Accounts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts and compute balance metrics', () => {
    expect(mockCommonService.get).toHaveBeenCalled();
    expect(component.accounts().length).toBe(2);
    expect(component.totalBalanceSum()).toBe(20000);
  });

  it('should select an account', () => {
    const account = mockAccountsResponse.data[0];
    component.selectAccount(account);
    expect(component.selectedAccount()).toEqual(account);
  });

  it('should deposit funds successfully', () => {
    component.selectAccount(mockAccountsResponse.data[0]);
    component.depositForm.setValue({ amount: 1000 });
    component.executeDeposit();
    expect(mockCommonService.put).toHaveBeenCalled();
  });

  it('should withdraw funds successfully', () => {
    component.selectAccount(mockAccountsResponse.data[0]);
    component.withdrawForm.setValue({ amount: 1000 });
    component.executeWithdraw();
    expect(mockCommonService.put).toHaveBeenCalled();
  });

  it('should transfer funds successfully', () => {
    component.selectAccount(mockAccountsResponse.data[0]);
    component.transferForm.setValue({
      destAccountNumber: 'ACC0002',
      amount: 1000
    });
    component.executeTransfer();
    expect(mockCommonService.put).toHaveBeenCalled();
  });

  it('should delete account successfully', () => {
    component.selectAccount(mockAccountsResponse.data[0]);
    component.openDeleteConfirm();
    expect(component.isDeleteConfirmOpen()).toBe(true);
    component.executeDeleteAccount();
    expect(mockCommonService.delete).toHaveBeenCalled();
  });
});
