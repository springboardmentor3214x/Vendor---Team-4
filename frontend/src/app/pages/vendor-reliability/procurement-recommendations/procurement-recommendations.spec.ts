import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementRecommendations } from './procurement-recommendations';

describe('ProcurementRecommendations', () => {
  let component: ProcurementRecommendations;
  let fixture: ComponentFixture<ProcurementRecommendations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementRecommendations],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementRecommendations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
