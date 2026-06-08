import { TestBed } from '@angular/core/testing';

import { LoginAdministratorService } from '../service/login-administrator-service';

describe('LoginAdministratorService', () => {
  let service: LoginAdministratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginAdministratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
