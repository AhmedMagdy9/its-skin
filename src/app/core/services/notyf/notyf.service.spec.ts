import { TestBed } from '@angular/core/testing';

import { NotyfService } from './notyf.service';

describe('NotyfService', () => {
  let service: NotyfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotyfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
