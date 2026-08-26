import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorMessaging } from './vendor-messaging';

describe('VendorMessaging', () => {
  let component: VendorMessaging;
  let fixture: ComponentFixture<VendorMessaging>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorMessaging],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorMessaging);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
