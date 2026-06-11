import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchableTable } from './searchable-table';

describe('SearchableTable', () => {
  let component: SearchableTable;
  let fixture: ComponentFixture<SearchableTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchableTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchableTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
