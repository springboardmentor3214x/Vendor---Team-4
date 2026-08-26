import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationTracking } from './communication-tracking';

describe('CommunicationTracking', () => {
  let component: CommunicationTracking;
  let fixture: ComponentFixture<CommunicationTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationTracking],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
