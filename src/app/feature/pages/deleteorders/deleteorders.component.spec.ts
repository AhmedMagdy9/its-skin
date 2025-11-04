import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteordersComponent } from './deleteorders.component';

describe('DeleteordersComponent', () => {
  let component: DeleteordersComponent;
  let fixture: ComponentFixture<DeleteordersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteordersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
