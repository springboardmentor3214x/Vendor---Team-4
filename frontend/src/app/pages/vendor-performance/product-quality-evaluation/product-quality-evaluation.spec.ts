import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductQualityEvaluation } from './product-quality-evaluation';

describe('ProductQualityEvaluation', () => {
  let component: ProductQualityEvaluation;
  let fixture: ComponentFixture<ProductQualityEvaluation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductQualityEvaluation],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductQualityEvaluation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
