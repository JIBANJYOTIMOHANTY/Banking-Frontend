import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DashboardAdministrator } from './dashboard-administrator';
import { AccountsService } from '../accounts/service/accounts-service';
import { TransactionsService } from '../transactions/service/transactions-service';
import { CommonService } from '../common-service/common-service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('DashboardAdministrator', () => {
  let component: DashboardAdministrator;
  let fixture: ComponentFixture<DashboardAdministrator>;

  beforeEach(async () => {
    const mockCommonService = {
      post: vi.fn().mockReturnValue(of({ status: 0 })),
      get: vi.fn().mockReturnValue(of({ status: 0 }))
    };
    const mockAccountsService = {
      getAccounts: vi.fn().mockReturnValue(of({ status: 0, data: [] }))
    };
    const mockTransactionsService = {
      getAllTransactions: vi.fn().mockReturnValue(of({ status: 0, data: [] }))
    };

    await TestBed.configureTestingModule({
      imports: [DashboardAdministrator],
      providers: [
        provideRouter([]),
        { provide: CommonService, useValue: mockCommonService },
        { provide: AccountsService, useValue: mockAccountsService },
        { provide: TransactionsService, useValue: mockTransactionsService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAdministrator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
