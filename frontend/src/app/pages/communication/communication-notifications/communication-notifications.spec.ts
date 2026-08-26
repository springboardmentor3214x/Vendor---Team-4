import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationNotifications } from './communication-notifications';

describe('CommunicationNotifications', () => {
  let component: CommunicationNotifications;
  let fixture: ComponentFixture<CommunicationNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationNotifications],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationNotifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
