import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationHistory } from './communication-history';

describe('CommunicationHistory', () => {
  let component: CommunicationHistory;
  let fixture: ComponentFixture<CommunicationHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
