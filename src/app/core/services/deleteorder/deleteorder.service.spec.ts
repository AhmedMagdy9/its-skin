import { TestBed } from '@angular/core/testing';

import { DeleteorderService } from './deleteorder.service';

describe('DeleteorderService', () => {
  let service: DeleteorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeleteorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
