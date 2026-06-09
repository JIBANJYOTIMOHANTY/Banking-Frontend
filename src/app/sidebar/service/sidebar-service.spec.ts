import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarService } from './sidebar-service';

describe('SidebarService', () => {
  let service: SidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SidebarService,
        provideRouter([])
      ]
    });
    service = TestBed.inject(SidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
