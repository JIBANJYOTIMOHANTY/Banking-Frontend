import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Accounts } from './accounts';
import { AccountsService } from './service/accounts-service';

describe('Accounts', () => {
  let component: Accounts;
  let fixture: ComponentFixture<Accounts>;
  let mockAccountsService: any;

  const mockAccountsResponse = {
    status: 0,
    message: 'Success',
    data: [
      { id: 1, accountNumber: 'ACC0001', firstName: 'John', lastName: 'Doe', balance: 5000 },
      { id: 2, accountNumber: 'ACC0002', firstName: 'Jane', lastName: 'Smith', balance: 15000 }
    ]
  };

  beforeEach(async () => {
    mockAccountsService = {
      getAccounts: vi.fn().mockReturnValue(of(mockAccountsResponse)),
      createAccount: vi.fn().mockReturnValue(of({ status: 0, message: 'Created successfully' })),
      deposit: vi.fn().mockReturnValue(of({ status: 0, message: 'Transaction successful' })),
      withdraw: vi.fn().mockReturnValue(of({ status: 0, message: 'Transaction successful' })),
      transfer: vi.fn().mockReturnValue(of({ status: 0, message: 'Transaction successful' })),
      deleteAccount: vi.fn().mockReturnValue(of({ status: 0, message: 'Deleted successfully' }))
    };

    await TestBed.configureTestingModule({
      imports: [Accounts, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AccountsService, useValue: mockAccountsService }
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
    expect(mockAccountsService.getAccounts).toHaveBeenCalled();
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
    expect(mockAccountsService.deposit).toHaveBeenCalledWith('ACC0001', 1000);
  });

  it('should withdraw funds successfully', () => {
    component.selectAccount(mockAccountsResponse.data[0]);
    component.withdrawForm.setValue({ amount: 1000 });
    component.executeWithdraw();
    expect(mockAccountsService.withdraw).toHaveBeenCalledWith('ACC0001', 1000);
  });

  it('should transfer funds successfully', () => {
    component.selectAccount(mockAccountsResponse.data[0]);
    component.transferForm.setValue({
      destAccountNumber: 'ACC0002',
      amount: 1000
    });
    component.executeTransfer();
    expect(mockAccountsService.transfer).toHaveBeenCalledWith('ACC0001', 'ACC0002', 1000);
  });

  it('should delete account successfully', () => {
    component.selectAccount(mockAccountsResponse.data[0]);
    component.openDeleteConfirm();
    expect(component.isDeleteConfirmOpen()).toBe(true);
    component.executeDeleteAccount();
    expect(mockAccountsService.deleteAccount).toHaveBeenCalledWith('ACC0001');
  });
});
