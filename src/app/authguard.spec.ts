import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Authguard } from './authguard';

describe('Authguard', () => {
  let service: Authguard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Authguard,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(Authguard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
