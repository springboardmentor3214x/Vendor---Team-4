import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementRequestList } from './procurement-request-list';

describe('ProcurementRequestList', () => {
  let component: ProcurementRequestList;
  let fixture: ComponentFixture<ProcurementRequestList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementRequestList],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementRequestList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
