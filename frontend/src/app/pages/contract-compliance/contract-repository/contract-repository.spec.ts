import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRepository } from './contract-repository';

describe('ContractRepository', () => {
  let component: ContractRepository;
  let fixture: ComponentFixture<ContractRepository>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractRepository],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractRepository);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
