import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSkeletonLoading } from './custom-skeleton-loading';

describe('CustomSkeletonLoading', () => {
  let component: CustomSkeletonLoading;
  let fixture: ComponentFixture<CustomSkeletonLoading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSkeletonLoading]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSkeletonLoading);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
