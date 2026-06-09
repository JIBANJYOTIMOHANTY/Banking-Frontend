import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DashboardAdministrator } from './dashboard-administrator';

describe('DashboardAdministrator', () => {
  let component: DashboardAdministrator;
  let fixture: ComponentFixture<DashboardAdministrator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAdministrator],
      providers: [
        provideRouter([])
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
