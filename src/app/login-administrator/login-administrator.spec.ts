import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { LoginAdministrator } from './login-administrator';
import { LoginAdministratorService } from './service/login-administrator-service';
import { of } from 'rxjs';

describe('LoginAdministrator', () => {
  let component: LoginAdministrator;
  let fixture: ComponentFixture<LoginAdministrator>;

  beforeEach(async () => {
    const loginServiceMock = {
      login: () => of({}),
      register: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [LoginAdministrator],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: LoginAdministratorService, useValue: loginServiceMock }
      ]
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
