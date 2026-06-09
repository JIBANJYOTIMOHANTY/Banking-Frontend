import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CustomersManagement } from './customers-management';
import { CommonService } from '../common-service/common-service';

describe('CustomersManagement', () => {
  let component: CustomersManagement;
  let fixture: ComponentFixture<CustomersManagement>;
  let mockCommonService: any;

  const mockCustomersResponse = {
    status: 0,
    message: 'Success',
    data: [
      { id: 1, accountNumber: 'ACC0001', firstName: 'John', lastName: 'Doe', balance: 5000 },
      { id: 2, accountNumber: 'ACC0002', firstName: 'Jane', lastName: 'Smith', balance: 15000 }
    ]
  };

  beforeEach(async () => {
    mockCommonService = {
      get: vi.fn().mockReturnValue(of(mockCustomersResponse)),
      post: vi.fn().mockReturnValue(of({ status: 0, message: 'Created successfully' })),
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

    component.searchQuery.set('ACC0002');
    expect(component.filteredCustomers().length).toBe(1);
    expect(component.filteredCustomers()[0].lastName).toBe('Smith');
  });

  it('should open and close add modal', () => {
    component.openAddModal();
    expect(component.isAddModalOpen()).toBe(true);
    component.closeAddModal();
    expect(component.isAddModalOpen()).toBe(false);
  });

  it('should open and close edit modal', () => {
    const customer = mockCustomersResponse.data[0];
    component.openEditModal(customer);
    expect(component.isEditModalOpen()).toBe(true);
    expect(component.selectedCustomer()).toEqual(customer);
    expect(component.editForm.value.firstName).toBe('John');
    
    component.closeEditModal();
    expect(component.isEditModalOpen()).toBe(false);
    expect(component.selectedCustomer()).toBeNull();
  });

  it('should register a new customer', () => {
    component.openAddModal();
    component.addForm.setValue({
      firstName: 'Bob',
      lastName: 'Smith',
      initialBalance: 1000
    });
    component.submitAddCustomer();
    expect(mockCommonService.post).toHaveBeenCalled();
  });

  it('should update a customer', () => {
    const customer = mockCustomersResponse.data[0];
    component.openEditModal(customer);
    component.editForm.setValue({
      firstName: 'Johnny',
      lastName: 'Doe'
    });
    component.submitEditCustomer();
    expect(mockCommonService.patch).toHaveBeenCalled();
  });
});
