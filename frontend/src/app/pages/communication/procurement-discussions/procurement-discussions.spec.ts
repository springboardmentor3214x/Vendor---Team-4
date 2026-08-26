import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementDiscussions } from './procurement-discussions';

describe('ProcurementDiscussions', () => {
  let component: ProcurementDiscussions;
  let fixture: ComponentFixture<ProcurementDiscussions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementDiscussions],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementDiscussions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
