import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryPerformance } from './delivery-performance';

describe('DeliveryPerformance', () => {
  let component: DeliveryPerformance;
  let fixture: ComponentFixture<DeliveryPerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryPerformance],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryPerformance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
