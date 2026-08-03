import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationManagement } from './certification-management';

describe('CertificationManagement', () => {
  let component: CertificationManagement;
  let fixture: ComponentFixture<CertificationManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificationManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificationManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
