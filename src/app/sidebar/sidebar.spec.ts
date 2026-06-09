import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';
import { SidebarService } from './service/sidebar-service';
import { CommonService } from '../common-service/common-service';
import { vi } from 'vitest';
import { of } from 'rxjs';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let mockCommonService: any;

  beforeEach(async () => {
    mockCommonService = {
      post: vi.fn().mockReturnValue(of({ status: 0 }))
    };

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        SidebarService,
        provideRouter([]),
        { provide: CommonService, useValue: mockCommonService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
