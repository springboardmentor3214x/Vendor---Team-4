import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDashboard } from './contract-dashboard';

describe('ContractDashboard', () => {
  let component: ContractDashboard;
  let fixture: ComponentFixture<ContractDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
