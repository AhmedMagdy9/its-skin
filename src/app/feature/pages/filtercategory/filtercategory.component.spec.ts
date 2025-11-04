import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltercategoryComponent } from './filtercategory.component';

describe('FiltercategoryComponent', () => {
  let component: FiltercategoryComponent;
  let fixture: ComponentFixture<FiltercategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltercategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltercategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
