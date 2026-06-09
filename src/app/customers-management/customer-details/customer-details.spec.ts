import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CustomerDetails } from './customer-details';
import { CommonService } from '../../common-service/common-service';

describe('CustomerDetails', () => {
  let component: CustomerDetails;
  let fixture: ComponentFixture<CustomerDetails>;
  let mockCommonService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockCommonService = {
      post: vi.fn().mockReturnValue(of({ status: 0, message: 'Created successfully' }))
    };

    await TestBed.configureTestingModule({
      imports: [CustomerDetails, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: CommonService, useValue: mockCommonService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDetails);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle invalid form submission without hitting service', () => {
    component.submitCustomer();
    expect(mockCommonService.post).not.toHaveBeenCalled();
  });

  it('should register a new customer successfully and redirect', () => {
    const navigateSpy = vi.spyOn(mockRouter, 'navigate');
    component.addForm.setValue({
      firstName: 'Bob',
      lastName: 'Smith',
      initialBalance: 1000,
      dob: '1990-01-01',
      email: 'bob@example.com',
      countryCode: '+91',
      mobileNumber: '1234567890',
      govtId: '123456789012',
      govtIdType: 'aadhar',
      pan: 'ABCDE1234F',
      occupation: 'Developer',
      nomineeName: 'Jane Smith',
      nomineeRelation: 'Spouse',
      address: '123 Main Street',
      landmark: 'near park',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      pincode: '123456'
    });
    
    component.submitCustomer();
    expect(mockCommonService.post).toHaveBeenCalled();
  });
});
