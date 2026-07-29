import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementRiskDashboard } from './procurement-risk-dashboard';

describe('ProcurementRiskDashboard', () => {
  let component: ProcurementRiskDashboard;
  let fixture: ComponentFixture<ProcurementRiskDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementRiskDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementRiskDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
