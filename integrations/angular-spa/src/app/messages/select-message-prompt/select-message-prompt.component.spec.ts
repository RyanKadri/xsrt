import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMessagePromptComponent } from './select-message-prompt.component';

describe('SelectMessagePromptComponent', () => {
  let component: SelectMessagePromptComponent;
  let fixture: ComponentFixture<SelectMessagePromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectMessagePromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMessagePromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
