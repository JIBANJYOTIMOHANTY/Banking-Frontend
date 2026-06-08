import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginAdministrator } from './login-administrator';

describe('LoginAdministrator', () => {
  let component: LoginAdministrator;
  let fixture: ComponentFixture<LoginAdministrator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginAdministrator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginAdministrator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
