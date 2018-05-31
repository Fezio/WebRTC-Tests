import { TestBed, inject } from '@angular/core/testing';

import { ScreenCaptureService } from './screen-capture.service';

describe('ScreenCaptureService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScreenCaptureService]
    });
  });

  it('should be created', inject([ScreenCaptureService], (service: ScreenCaptureService) => {
    expect(service).toBeTruthy();
  }));
});
