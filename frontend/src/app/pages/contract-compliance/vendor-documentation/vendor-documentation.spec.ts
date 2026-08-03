import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDocumentation } from './vendor-documentation';

describe('VendorDocumentation', () => {
  let component: VendorDocumentation;
  let fixture: ComponentFixture<VendorDocumentation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorDocumentation],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorDocumentation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
