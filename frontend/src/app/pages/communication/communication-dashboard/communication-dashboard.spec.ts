import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationDashboard } from './communication-dashboard';

describe('CommunicationDashboard', () => {
  let component: CommunicationDashboard;
  let fixture: ComponentFixture<CommunicationDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
