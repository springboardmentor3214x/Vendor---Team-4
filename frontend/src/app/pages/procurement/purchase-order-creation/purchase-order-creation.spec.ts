import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderCreation } from './purchase-order-creation';

describe('PurchaseOrderCreation', () => {
  let component: PurchaseOrderCreation;
  let fixture: ComponentFixture<PurchaseOrderCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderCreation],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderCreation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
