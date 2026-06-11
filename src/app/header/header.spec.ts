import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';
import { CommonService } from '../common-service/common-service';
import { HeaderService } from './service/header-service';
import { vi } from 'vitest';
import { of } from 'rxjs';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let mockCommonService: any;
  let mockHeaderService: any;

  beforeEach(async () => {
    mockCommonService = {
      post: vi.fn().mockReturnValue(of({ status: 0 }))
    };
    mockHeaderService = {
      getAccounts: vi.fn().mockReturnValue(of({ status: 0, data: [] })),
      getActiveBroadcast: vi.fn().mockReturnValue(of({ status: 0, data: [] }))
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: CommonService, useValue: mockCommonService },
        { provide: HeaderService, useValue: mockHeaderService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
