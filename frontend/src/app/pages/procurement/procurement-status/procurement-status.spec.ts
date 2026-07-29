import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementStatus } from './procurement-status';

describe('ProcurementStatus', () => {
  let component: ProcurementStatus;
  let fixture: ComponentFixture<ProcurementStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
