import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSharing } from './file-sharing';

describe('FileSharing', () => {
  let component: FileSharing;
  let fixture: ComponentFixture<FileSharing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileSharing],
    }).compileComponents();

    fixture = TestBed.createComponent(FileSharing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
