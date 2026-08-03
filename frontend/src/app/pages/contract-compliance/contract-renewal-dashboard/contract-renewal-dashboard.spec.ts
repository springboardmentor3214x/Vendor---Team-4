import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRenewalDashboard } from './contract-renewal-dashboard';

describe('ContractRenewalDashboard', () => {
  let component: ContractRenewalDashboard;
  let fixture: ComponentFixture<ContractRenewalDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractRenewalDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractRenewalDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
