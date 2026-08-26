import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementApproval } from './procurement-approval';

describe('ProcurementApproval', () => {
  let component: ProcurementApproval;
  let fixture: ComponentFixture<ProcurementApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
