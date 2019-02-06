import { TestBed } from '@angular/core/testing';

import { MessageService } from './message-resolver.service';

describe('MessageResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MessageService = TestBed.get(MessageService);
    expect(service).toBeTruthy();
  });
});
