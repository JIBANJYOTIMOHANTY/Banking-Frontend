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
      get: vi.fn().mockReturnValue(of(mockCustomersResponse)),
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
    expect(mockCommonService.get).toHaveBeenCalled();
    expect(component.customers().length).toBe(2);
  });

  it('should filter customers by search query', () => {
    component.searchQuery.set('john');
    expect(component.filteredCustomers().length).toBe(1);
    expect(component.filteredCustomers()[0].firstName).toBe('John');

    component.searchQuery.set('123 Lane');
    expect(component.filteredCustomers().length).toBe(1);
    expect(component.filteredCustomers()[0].firstName).toBe('John');
  });

  it('should open edit modal', () => {
    const customer = mockCustomersResponse.data[0];
    component.openEditModal(customer);
    expect(component.isEditModalOpen()).toBe(true);
    expect(component.selectedCustomer()).toEqual(customer);
    expect(component.editForm.value.firstName).toBe('John');
    
    component.closeEditModal();
    expect(component.isEditModalOpen()).toBe(false);
    expect(component.selectedCustomer()).toBeNull();
  });

  it('should update a customer', () => {
    const customer = mockCustomersResponse.data[0];
    component.openEditModal(customer);
    component.editForm.setValue({
      firstName: 'Johnny',
      lastName: 'Doe',
      dob: '1985-05-05',
      email: 'johnny.doe@example.com',
      mobileNumber: '9876543210',
      govtId: 'XYZW98765',
      govtIdType: 'aadhar',
      occupation: 'Manager',
      nomineeName: 'Mary Doe',
      nomineeRelation: 'Mother',
      address: '456 Commercial Rd, Business District'
    });
    component.submitEditCustomer();
    expect(mockCommonService.patch).toHaveBeenCalled();
  });

  it('should navigate to customers/add on openAddModal', () => {
    const navigateSpy = vi.spyOn(mockRouter, 'navigate');
    component.openAddModal();
    expect(navigateSpy).toHaveBeenCalledWith(['/customers/add']);
  });
});
