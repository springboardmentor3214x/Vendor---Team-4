import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractNotifications } from './contract-notifications';

describe('ContractNotifications', () => {
  let component: ContractNotifications;
  let fixture: ComponentFixture<ContractNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractNotifications],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractNotifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
