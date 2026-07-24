import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorReliabilityDashboard } from './vendor-reliability-dashboard';

describe('VendorReliabilityDashboard', () => {
  let component: VendorReliabilityDashboard;
  let fixture: ComponentFixture<VendorReliabilityDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorReliabilityDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorReliabilityDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
