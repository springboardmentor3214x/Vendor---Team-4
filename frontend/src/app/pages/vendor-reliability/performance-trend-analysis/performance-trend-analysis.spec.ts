import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceTrendAnalysis } from './performance-trend-analysis';

describe('PerformanceTrendAnalysis', () => {
  let component: PerformanceTrendAnalysis;
  let fixture: ComponentFixture<PerformanceTrendAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceTrendAnalysis],
    }).compileComponents();

    fixture = TestBed.createComponent(PerformanceTrendAnalysis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
