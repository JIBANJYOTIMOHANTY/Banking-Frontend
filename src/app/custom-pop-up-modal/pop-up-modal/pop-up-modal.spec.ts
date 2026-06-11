import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpModal } from './pop-up-modal';

describe('PopUpModal', () => {
  let component: PopUpModal;
  let fixture: ComponentFixture<PopUpModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
