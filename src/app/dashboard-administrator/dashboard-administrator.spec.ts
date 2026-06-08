import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAdministrator } from './dashboard-administrator';

describe('DashboardAdministrator', () => {
  let component: DashboardAdministrator;
  let fixture: ComponentFixture<DashboardAdministrator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAdministrator]
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
