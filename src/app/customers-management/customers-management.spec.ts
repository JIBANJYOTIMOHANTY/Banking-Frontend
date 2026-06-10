import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CustomersManagement } from './customers-management';
import { CommonService } from '../common-service/common-service';

describe('CustomersManagement', () => {
  let component: CustomersManagement;
  let fixture: ComponentFixture<CustomersManagement>;
  let mockCommonService: any;
  let mockRouter: any;

  const mockCustomersResponse = {
    status: 0,
    message: 'Success',
    data: [
      { id: 1, accountNumber: 'ACC0001', firstName: 'John', lastName: 'Doe', balance: 5000, address: '123 Lane' },
      { id: 2, accountNumber: 'ACC0002', firstName: 'Jane', lastName: 'Smith', balance: 15000, address: '456 road' }
    ]
  };

  beforeEach(async () => {
    mockCommonService = {
      get: vi.fn().mockImplementation((url: string, query?: string) => {
        let data = mockCustomersResponse.data;
        const decodedUrl = decodeURIComponent(url);
        const queryVal = query || (decodedUrl.includes('?query=') ? decodedUrl.split('?query=')[1] : '');
        if (queryVal) {
          const queryPart = queryVal.toLowerCase();
          data = data.filter(c =>
            c.firstName.toLowerCase().includes(queryPart) ||
            c.lastName.toLowerCase().includes(queryPart) ||
            c.accountNumber.toLowerCase().includes(queryPart) ||
            c.address.toLowerCase().includes(queryPart)
          );
        }
        return of({
          status: 0,
          message: 'Success',
          data: data
        });
      }),
      post: vi.fn().mockImplementation((url: string, body: any) => {
        let data = mockCustomersResponse.data;
        const queryVal = body && body.query ? body.query : '';
        if (queryVal) {
          const queryPart = queryVal.toLowerCase();
          data = data.filter(c =>
            c.firstName.toLowerCase().includes(queryPart) ||
            c.lastName.toLowerCase().includes(queryPart) ||
            c.accountNumber.toLowerCase().includes(queryPart) ||
            c.address.toLowerCase().includes(queryPart)
          );
        }
        return of({
          status: 0,
          message: 'Success',
          data: data
        });
      }),
      patch: vi.fn().mockReturnValue(of({ status: 0, message: 'Updated successfully' }))
    };

    await TestBed.configureTestingModule({
      imports: [CustomersManagement, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: CommonService, useValue: mockCommonService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersManagement);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customers on init', () => {
    expect(mockCommonService.post).toHaveBeenCalled();
    expect(component.customers().length).toBe(2);
  });

  it('should filter customers by search query via backend request', () => {
    component.searchQuery.set('john');
    component.fetchCustomers();
    expect(component.filteredCustomers().length).toBe(1);
    expect(component.filteredCustomers()[0].firstName).toBe('John');

    component.searchQuery.set('123 Lane');
    component.fetchCustomers();
    expect(component.filteredCustomers().length).toBe(1);
    expect(component.filteredCustomers()[0].firstName).toBe('John');
  });

  it('should navigate to customers/edit on openEditPage', () => {
    const navigateSpy = vi.spyOn(mockRouter, 'navigate');
    const customer = mockCustomersResponse.data[0];
    component.openEditPage(customer);
    expect(navigateSpy).toHaveBeenCalledWith(['/customers/edit', customer.accountNumber]);
  });

  it('should navigate to customers/add on openAddModal', () => {
    const navigateSpy = vi.spyOn(mockRouter, 'navigate');
    component.openAddModal();
    expect(navigateSpy).toHaveBeenCalledWith(['/customers/add']);
  });
});
